const { pool } = require("../conn");
const { DateTime } = require("luxon");

const LeaseQueries = {
  createLease: async (
    propertyId,
    startDate,
    endDate,
    pricePerMonth,
    isRenewal,
    note = null,
    tenants = []
  ) => {
    await pool.query("BEGIN");

    const { previousLeaseId, currentTenants } = isRenewal
      ? await getRenewalInfo(propertyId)
      : { previousLeaseId: null, currentTenants: [] };

    try {
      const leaseQueryText =
        "INSERT INTO lease(property_id, start_date, end_date, price_per_month, is_renewal, previous_lease_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id";
      const leaseValues = [
        propertyId,
        startDate,
        endDate,
        pricePerMonth,
        isRenewal,
        previousLeaseId,
      ];
      const leaseResult = await pool.query(leaseQueryText, leaseValues);
      const leaseId = leaseResult.rows[0].id;

      if (note) {
        const noteQueryText =
          "INSERT INTO lease_note (lease_id, note) VALUES ($1, $2)";
        const noteValues = [leaseId, note];
        await pool.query(noteQueryText, noteValues);
      }

      const events = getLeaseEvents(startDate, endDate);
      for (let event of events) {
        const eventQueryText =
          "INSERT INTO lease_event (lease_id, due_date, description) VALUES ($1, $2, $3)";
        const eventValues = [leaseId, event.date, event.description];
        await pool.query(eventQueryText, eventValues);
      }

      if (isRenewal) {
        for (let tenant of currentTenants) {
          const tenantLeaseInsertQuery =
            "INSERT INTO tenant_lease (tenant_id, lease_id) VALUES ($1, $2)";
          await pool.query(tenantLeaseInsertQuery, [tenant.id, leaseId]);
        }
      } else {
        for (let tenant of tenants) {
          const tenantInsertQuery =
            "INSERT INTO tenant (name, email) VALUES ($1, $2) RETURNING id";
          const tenantInsertResult = await pool.query(tenantInsertQuery, [
            tenant.name,
            tenant.email,
          ]);
          const tenantId = tenantInsertResult.rows[0].id;

          const tenantLeaseInsertQuery =
            "INSERT INTO tenant_lease (tenant_id, lease_id) VALUES ($1, $2)";
          await pool.query(tenantLeaseInsertQuery, [tenantId, leaseId]);
        }
      }
      await pool.query("COMMIT");
      return leaseId;
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  },
  deleteLeaseById: async (id) => {
    return pool.query("DELETE FROM lease WHERE id = $1", [id]);
  },
};

const getRenewalInfo = async (propertyId) => {
  let previousLeaseId = null;
  let currentTenants = [];

  const prevLeaseQuery =
    "SELECT id FROM lease WHERE property_id = $1 ORDER BY start_date DESC LIMIT 1";
  const result = await pool.query(prevLeaseQuery, [propertyId]);

  if (result.rows.length > 0) {
    previousLeaseId = result.rows[0].id;

    const currentTenantQuery = `
            SELECT tenant.* 
            FROM tenant_lease 
            JOIN tenant ON tenant.id = tenant_lease.tenant_id 
            WHERE tenant_lease.lease_id = $1
        `;
    const tenantResult = await pool.query(currentTenantQuery, [
      previousLeaseId,
    ]);
    currentTenants = tenantResult.rows;
  } else {
    throw new Error("No previous lease found for renewal");
  }

  return {
    previousLeaseId,
    currentTenants,
  };
};

const getLeaseEvents = (startDateString, endDateString) => {
  const startDate = DateTime.fromISO(startDateString);
  const endDate = DateTime.fromISO(endDateString);

  const events = [
    { date: startDate.toISODate(), description: "START" },
    { date: endDate.toISODate(), description: "END" },
  ];

  const leaseMonths = endDate.diff(startDate, "months").months;
  if (leaseMonths > 2) {
    events.push({
      date: endDate.minus({ months: 2 }).toISODate(),
      description: "TWO_MONTH",
    });
    events.push({
      date: endDate.minus({ months: 1 }).toISODate(),
      description: "ONE_MONTH",
    });
  }
  if (leaseMonths > 6) {
    events.push({
      date: endDate.minus({ months: 6 }).toISODate(),
      description: "SIX_MONTH",
    });
  }
  return events;
};

module.exports = {
  getLeaseEvents,
  LeaseQueries,
};
