const { pool } = require("../conn");
const { DateTime } = require("luxon");
const { ValidationError, NotFoundError } = require("./types");
const { QueryHelpers } = require("./util");

const LeaseQueries = {
  insert: async (
    unitId,
    startDate,
    endDate,
    pricePerMonth,
    isRenewal,
    note = null,
    tenants = []
  ) => {
    const client = await pool.connect();
    try {
      await client.query(`BEGIN`);
      const existingLeases = await getLeasesForUnit(client, unitId);
      validateNewLease(startDate, endDate, isRenewal, tenants, existingLeases);

      const leaseResult = await QueryHelpers.insertWithClient(
        client,
        `INSERT INTO lease(unit_id, start_date, end_date, price_per_month, is_renewal) VALUES($1, $2, $3, $4, $5) RETURNING id`,
        [unitId, startDate, endDate, pricePerMonth, isRenewal],
        "lease already exists"
      );
      const leaseId = leaseResult.rows[0].id;

      if (note) {
        await QueryHelpers.insertWithClient(
          client,
          `INSERT INTO lease_note (lease_id, note) VALUES ($1, $2)`,
          [leaseId, note],
          "note already exists"
        );
      }

      const events = getLeaseEvents(startDate, endDate);
      for (let event of events) {
        await QueryHelpers.insertWithClient(
          client,
          `INSERT INTO lease_event (lease_id, due_date, description) VALUES ($1, $2, $3)`,
          [leaseId, event.date, event.description],
          "lease event already exists"
        );
      }

      if (isRenewal) {
        const prevLease = getPreviousLease(startDate, existingLeases);
        for (let tenantId of prevLease.tenantIds) {
          await QueryHelpers.insertWithClient(
            client,
            `INSERT INTO tenant_lease (tenant_id, lease_id) VALUES ($1, $2)`,
            [tenantId, leaseId],
            "tenant lease already exists"
          );
        }
      } else {
        for (let tenant of tenants) {
          const tenantInsertResult = await QueryHelpers.insertWithClient(
            client,
            `INSERT INTO tenant (name, email) VALUES ($1, $2) RETURNING id`,
            [tenant.name, tenant.email],
            "tenant already exists"
          );

          const tenantId = tenantInsertResult.rows[0].id;
          await QueryHelpers.insertWithClient(
            client,
            `INSERT INTO tenant_lease (tenant_id, lease_id) VALUES ($1, $2)`,
            [tenantId, leaseId],
            "tenant lease already exists"
          );
        }
      }
      await client.query(`COMMIT`);
    } catch (e) {
      console.error(e);
      await client.query(`ROLLBACK`);
      throw e;
    } finally {
      client.release();
    }
  },
  delete: (id) => {
    return QueryHelpers.delete(`DELETE FROM lease WHERE id = $1`, [id]);
  },
};

const getPreviousLease = (startDate, existingLeases) => {
  const leaseStartDate = DateTime.fromISO(startDate);
  const prevLeaseIndex = existingLeases.findIndex(
    (lease) => leaseStartDate > lease.startDate
  );
  if (prevLeaseIndex === -1) {
    throw new NotFoundError("Failed to find previous lease");
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
    throw new ValidationError("Tenants cannot be provided for renewal lease.");
  }
  if (!isRenewal && tenants.length === 0) {
    throw new ValidationError("Tenants must be provided for non-renewal lease");
  }

  // check 2: lease startDate and endDate are valid
  const leaseStartDate = DateTime.fromISO(startDate);
  const leaseEndDate = DateTime.fromISO(endDate);
  if (leaseStartDate.plus({ months: 1 }) > leaseEndDate) {
    throw new ValidationError(
      "StartDate should come at least one month before EndDate"
    );
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
      throw new ValidationError("New lease overlaps with an existing lease");
    }
  }

  if (isRenewal) {
    // check 4: the first lease cannot be a renewal
    const indexToInsert = existingLeases.findIndex(
      (lease) => leaseStartDate > lease.startDate
    );
    if (indexToInsert === -1) {
      throw new ValidationError("First lease for a unit cannot be a renewal");
    }

    // check 5: if lease is a renewal then it must start right after previous lease
    const prevLease = existingLeases[indexToInsert];
    if (!prevLease.endDate.plus({ days: 1 }).equals(leaseStartDate)) {
      throw new ValidationError(
        "Renewal lease must start directly after previous lease"
      );
    }
  }
};

const getLeasesForUnit = async (client, unitId) => {
  const query = `
      SELECT 
        l.start_date,
        l.end_date,
        l.is_renewal,
        array_agg(tl.tenant_id) AS tenant_ids
      FROM lease l
      LEFT JOIN tenant_lease tl ON l.id = tl.lease_id
      WHERE l.unit_id = $1
      GROUP BY l.id
      ORDER BY l.start_date DESC;
    `;

  const { rows } = await client.query(query, [unitId]);

  return rows.map((row) => {
    return {
      startDate: DateTime.fromJSDate(row.start_date),
      endDate: DateTime.fromJSDate(row.end_date),
      isRenewal: row.is_renewal,
      tenantIds: row.tenant_ids,
    };
  });
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
