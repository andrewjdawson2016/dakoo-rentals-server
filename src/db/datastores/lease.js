const { pool } = require("../conn");
const { DateTime } = require("luxon");

const LeaseQueries = {
  insert: async (
    propertyId,
    startDate,
    endDate,
    pricePerMonth,
    isRenewal,
    note = null,
    tenants = []
  ) => {
    await pool.query("BEGIN");

    try {
      const existingLeases = await getLeasesForProperty(propertyId);
      validateNewLease(startDate, endDate, isRenewal, tenants, existingLeases);

      const leaseQueryText =
        "INSERT INTO lease(property_id, start_date, end_date, price_per_month, is_renewal) VALUES($1, $2, $3, $4, $5) RETURNING id";
      const leaseValues = [
        propertyId,
        startDate,
        endDate,
        pricePerMonth,
        isRenewal,
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
        const prevLease = getPreviousLease(startDate, existingLeases);
        for (let tenantId of prevLease.tenantIds) {
          const tenantLeaseInsertQuery =
            "INSERT INTO tenant_lease (tenant_id, lease_id) VALUES ($1, $2)";
          await pool.query(tenantLeaseInsertQuery, [tenantId, leaseId]);
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
  delete: async (id) => {
    return pool.query("DELETE FROM lease WHERE id = $1", [id]);
  },
};

const getPreviousLease = (startDate, existingLeases) => {
  const leaseStartDate = DateTime.fromISO(startDate);
  const prevLeaseIndex = existingLeases.findIndex(
    (lease) => leaseStartDate > lease.startDate
  );
  if (prevLeaseIndex === -1) {
    throw new Error("Failed to find previous lease");
  }
  return existingLeases[prevLeaseIndex];
};

const validateNewLease = (
  startDate,
  endDate,
  isRenewal,
  tenants,
  existingLeases
) => {
  // check 1: combination of isRenewal and tenants is valid
  if (isRenewal && tenants.length > 0) {
    throw new Error("Tenants cannot be provided for renewal lease.");
  }
  if (!isRenewal && tenants.length === 0) {
    throw new Error("Tenants must be provided for non-renewal lease");
  }

  // check 2: lease startDate and endDate are valid
  const leaseStartDate = DateTime.fromISO(startDate);
  const leaseEndDate = DateTime.fromISO(endDate);
  if (leaseStartDate.plus({ months: 1 }) > leaseEndDate) {
    throw new Error("StartDate should come at least one month before EndDate.");
  }

  // check 3: leases cannot overlap
  for (const lease of existingLeases) {
    const existingStart = lease.startDate;
    const existingEnd = lease.endDate;

    if (
      (leaseStartDate >= existingStart && leaseStartDate <= existingEnd) ||
      (leaseEndDate >= existingStart && leaseEndDate <= existingEnd) ||
      (leaseStartDate <= existingStart && leaseEndDate >= existingEnd)
    ) {
      throw new Error("New lease overlaps with an existing lease.");
    }
  }

  if (isRenewal) {
    // check 4: the first lease cannot be a renewal
    const indexToInsert = existingLeases.findIndex(
      (lease) => leaseStartDate > lease.startDate
    );
    if (indexToInsert === -1) {
      throw new Error("First lease for a property cannot be a renewal");
    }

    // check 5: if lease is a renewal then it must start right after previous lease
    const prevLease = existingLeases[indexToInsert];
    if (!prevLease.endDate.plus({ days: 1 }).equals(leaseStartDate)) {
      throw new Error("Renewal lease must start directly after previous lease");
    }
  }

  return null;
};

const getLeasesForProperty = async (propertyId) => {
  try {
    const query = `
      SELECT 
        l.start_date,
        l.end_date,
        l.is_renewal,
        array_agg(tl.tenant_id) AS tenant_ids
      FROM lease l
      LEFT JOIN tenant_lease tl ON l.id = tl.lease_id
      WHERE l.property_id = $1
      GROUP BY l.id
      ORDER BY l.start_date DESC;
    `;

    const { rows } = await pool.query(query, [propertyId]);

    return rows.map((row) => {
      return {
        startDate: DateTime.fromJSDate(row.start_date),
        endDate: DateTime.fromJSDate(row.end_date),
        isRenewal: row.is_renewal,
        tenantIds: row.tenant_ids,
      };
    });
  } catch (err) {
    console.error("Error fetching leases for property:", err);
    throw err;
  }
};

const getLeaseEvents = (startDateString, endDateString) => {
  const startDate = DateTime.fromISO(startDateString);
  const endDate = DateTime.fromISO(endDateString);

  const events = [
    { date: startDate.toISODate(), description: "START" },
    { date: endDate.toISODate(), description: "END" },
  ];

  const leaseMonths = endDate.diff(startDate, "months").months;
  if (leaseMonths > 1) {
    events.push({
      date: endDate.minus({ months: 1 }).toISODate(),
      description: "ONE_MONTH",
    });
  }
  if (leaseMonths > 2) {
    events.push({
      date: endDate.minus({ months: 2 }).toISODate(),
      description: "TWO_MONTH",
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
  validateNewLease,
  getLeaseEvents,
  LeaseQueries,
};
