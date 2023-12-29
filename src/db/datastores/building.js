const {
  Building,
  Unit,
  Lease,
  Expense,
  LeaseEvent,
  LeaseNote,
  Tenant,
  NotFoundError,
} = require("./types");
const { pool } = require("../conn");
const { QueryHelpers } = require("./util");

const BuildingQueries = {
  delete: (id, userId) => {
    return QueryHelpers.delete(
      `DELETE FROM building WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },

  insert: async (
    address,
    nickname,
    buildingType,
    firstRentalMonth,
    unitNumbers,
    userId
  ) => {
    const client = await pool.connect();
    try {
      await client.query(`BEGIN`);
      const buildingResult = await QueryHelpers.insertWithClient(
        client,
        `INSERT INTO building (address, nickname, building_type, first_rental_month, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [address, nickname, buildingType, firstRentalMonth, userId],
        "building already exists"
      );
      const buildingId = buildingResult.rows[0].id;
      if (buildingType === "SINGLE_FAMILY") {
        unitNumbers = [address];
      }
      for (let unitNumber of unitNumbers) {
        await QueryHelpers.insertWithClient(
          client,
          `INSERT INTO unit (building_id, unit_number, user_id) VALUES ($1, $2, $3)`,
          [buildingId, unitNumber, userId],
          "unit already exists"
        );
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

  getById: async (id, userId) => {
    const client = await pool.connect();
    try {
      const buildingQueryResult = await client.query(
        `SELECT * FROM building WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      if (buildingQueryResult.rows.length === 0) {
        throw new NotFoundError("Failed to find building with id: ", id);
      }

      const buildingRow = buildingQueryResult.rows[0];
      const building = Building.fromRow(buildingRow);

      const expenseQueryResult = await client.query(
        `SELECT * FROM expense WHERE building_id = $1 AND user_id = $2 ORDER BY month_year DESC`,
        [id, userId]
      );

      for (const expense of expenseQueryResult.rows) {
        building.addExpense(Expense.fromRow(expense));
      }

      const unitQueryResult = await client.query(
        `SELECT * FROM unit WHERE building_id = $1 AND user_id = $2 ORDER BY unit_number ASC`,
        [id, userId]
      );

      for (const unitRow of unitQueryResult.rows) {
        const unit = Unit.fromRow(unitRow);
        const leaseQueryResult = await client.query(
          `SELECT * FROM lease WHERE unit_id = $1 AND user_id = $2 ORDER BY start_date DESC`,
          [unitRow.id, userId]
        );

        for (const leaseRow of leaseQueryResult.rows) {
          const lease = Lease.fromRow(leaseRow);

          const tenantLeaseQueryResult = await client.query(
            `SELECT tenant.* FROM tenant 
             JOIN tenant_lease ON tenant.id = tenant_lease.tenant_id 
             WHERE tenant_lease.lease_id = $1
             AND tenant_lease.user_id = $2 
             ORDER BY tenant.name DESC`,
            [leaseRow.id, userId]
          );
          for (const tenantRow of tenantLeaseQueryResult.rows) {
            lease.addTenant(Tenant.fromRow(tenantRow));
          }

          const leaseNoteQueryResult = await client.query(
            `SELECT * FROM lease_note WHERE lease_id = $1 AND user_id = $2 ORDER BY created_at ASC`,
            [leaseRow.id, userId]
          );
          for (const noteRow of leaseNoteQueryResult.rows) {
            lease.addLeaseNote(LeaseNote.fromRow(noteRow));
          }

          const leaseEventQueryResult = await client.query(
            `SELECT * FROM lease_event WHERE lease_id = $1 AND user_id = $2 ORDER BY due_date ASC`,
            [leaseRow.id, userId]
          );
          for (const eventRow of leaseEventQueryResult.rows) {
            lease.addLeaseEvent(LeaseEvent.fromRow(eventRow));
          }

          unit.addLease(lease);
        }

        building.addUnit(unit);
      }

      return building;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      client.release();
    }
  },

  list: async (userId) => {
    const client = await pool.connect();
    try {
      const buildings = [];
      const selectBuildingsResult = await client.query(
        `SELECT id FROM building WHERE user_id = $1 ORDER BY address ASC`,
        [userId]
      );

      for (const buildingRow of selectBuildingsResult.rows) {
        const buildingId = buildingRow.id;
        const building = await BuildingQueries.getById(buildingId);
        buildings.push(building);
      }

      return buildings;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      client.release();
    }
  },
};

module.exports = {
  BuildingQueries,
};
