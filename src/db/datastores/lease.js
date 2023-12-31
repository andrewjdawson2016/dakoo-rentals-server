const { pool } = require("../conn");
const { DateTime } = require("luxon");
const { Building, ValidationError, NotFoundError } = require("./types");
const { QueryHelpers } = require("./util");

const LeaseQueries = {
  insert: async (
    unitId,
    startDate,
    endDate,
    pricePerMonth,
    isRenewal,
    note = null,
    tenants = [],
    userId
  ) => {
    const client = await pool.connect();
    try {
      await client.query(`BEGIN`);
      const buildingQueryResult = await client.query(
        `SELECT b.first_rental_month
        FROM unit u
        JOIN building b ON u.building_id = b.id
        WHERE u.id = $1 AND u.user_id = $2;
        `,
        [unitId, userId]
      );
      if (buildingQueryResult.rows.length === 0) {
        throw new NotFoundError(
          "Failed to find building for unit with id: ",
          unitId
        );
      }
      const buildingRow = buildingQueryResult.rows[0];
      const building = Building.fromRow(buildingRow);

      const existingLeases = await getLeasesForUnit(client, unitId, userId);
      validateNewLease(
        startDate,
        endDate,
        isRenewal,
        tenants,
        existingLeases,
        building.first_rental_month
      );

      const leaseResult = await QueryHelpers.insertWithClient(
        client,
        `INSERT INTO lease(unit_id, start_date, end_date, price_per_month, is_renewal, user_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
        [unitId, startDate, endDate, pricePerMonth, isRenewal, userId],
        "lease already exists"
      );
      const leaseId = leaseResult.rows[0].id;

      if (note) {
        await QueryHelpers.insertWithClient(
          client,
          `INSERT INTO lease_note (lease_id, note, user_id) VALUES ($1, $2, $3)`,
          [leaseId, note, userId],
          "note already exists"
        );
      }

      const events = getLeaseEvents(startDate, endDate);
      for (let event of events) {
        await QueryHelpers.insertWithClient(
          client,
          `INSERT INTO lease_event (lease_id, due_date, description, user_id) VALUES ($1, $2, $3, $4)`,
          [leaseId, event.date, event.description, userId],
          "lease event already exists"
        );
      }

      if (isRenewal) {
        const prevLease = getPreviousLease(startDate, existingLeases);
        for (let tenantId of prevLease.tenantIds) {
          await QueryHelpers.insertWithClient(
            client,
            `INSERT INTO tenant_lease (tenant_id, lease_id, user_id) VALUES ($1, $2, $3)`,
            [tenantId, leaseId, userId],
            "tenant lease already exists"
          );
        }
      } else {
        for (let tenant of tenants) {
          const tenantInsertResult = await QueryHelpers.insertWithClient(
            client,
            `INSERT INTO tenant (name, email, user_id) VALUES ($1, $2, $3) RETURNING id`,
            [tenant.name, tenant.email, userId],
            "tenant already exists"
          );

          const tenantId = tenantInsertResult.rows[0].id;
          await QueryHelpers.insertWithClient(
            client,
            `INSERT INTO tenant_lease (tenant_id, lease_id, user_id) VALUES ($1, $2, $3)`,
            [tenantId, leaseId, userId],
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
  delete: (id, userId) => {
    return QueryHelpers.delete(
      `DELETE FROM lease WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
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
  existingLeases,
  firstRentalMonth
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

    // check 6: lease must start no earlier than firstRentalMonth
    const firstRentalDate = DateTime.fromISO(`${firstRentalMonth}-01`);
    if (leaseStartDate < firstRentalDate) {
      throw new ValidationError(
        `Lease start date cannot be earlier than the first rental month (${firstRentalMonth})`
      );
    }
  }
};

const getLeasesForUnit = async (client, unitId, userId) => {
  const query = `
      SELECT 
        l.start_date,
        l.end_date,
        l.is_renewal,
        array_agg(tl.tenant_id) AS tenant_ids
      FROM lease l
      LEFT JOIN tenant_lease tl ON l.id = tl.lease_id
      WHERE l.unit_id = $1
      AND l.user_id = $2
      GROUP BY l.id
      ORDER BY l.start_date DESC;
    `;

  const { rows } = await client.query(query, [unitId, userId]);

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
