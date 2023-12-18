const {
  Building,
  Unit,
  Lease,
  LeaseEvent,
  LeaseNote,
  Tenant,
} = require("./types");
const { pool } = require("../conn");
const { QueryHelpers } = require("./util");

const BuildingQueries = {
  delete: (id) => {
    return QueryHelpers.delete(`DELETE FROM building WHERE id = $1`, [id]);
  },
  insert: async (address, nickname, buildingType, unitNumbers) => {
    const client = await pool.connect();
    try {
      await client.query(`BEGIN`);
      const buildingResult = await QueryHelpers.insertWithClient(
        client,
        `INSERT INTO building (address, nickname, building_type) VALUES ($1, $2, $3)`,
        [address, nickname, buildingType],
        "building already exists"
      );
      const buildingId = buildingResult.rows[0].id;
      for (let unitNumber of unitNumbers) {
        await QueryHelpers.insertWithClient(
          client,
          `INSERT INTO unit (building_id, unit_number) VALUES ($1, $2)`,
          [buildingId, unitNumber],
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
  list: async () => {
    const client = await pool.connect();
    try {
      const buildings = [];
      const selectBuildingsResult = await client.query(
        `SELECT * FROM building ORDER BY address ASC`
      );
      for (const buildingRow of selectBuildingsResult.rows) {
        const building = Building.fromRow(buildingRow);
        const unitQueryResult = await client.query(
          `SELECT * from unit WHERE building_id = $1 ORDER BY unit_number ASC`,
          [buildingRow.id]
        );
        for (const unitRow of unitQueryResult.rows) {
          const leaseQueryResult = await client.query(
            `SELECT * from lease WHERE unit_id = $1 ORDER BY start_date DESC`,
            [unitRow.id]
          );
          const unit = Unit.fromRow(unitRow);
          for (const leaseRow of leaseQueryResult.rows) {
            const lease = Lease.fromRow(leaseRow);
            const tenantLeaseQueryResult = await client.query(
              `
                            SELECT tenant.* FROM tenant 
                            JOIN tenant_lease ON tenant.id = tenant_lease.tenant_id 
                            WHERE tenant_lease.lease_id = $1 
                            ORDER BY tenant.name DESC`,
              [lease.id]
            );
            for (const tenantRow of tenantLeaseQueryResult.rows) {
              lease.addTenant(Tenant.fromRow(tenantRow));
            }

            const leaseNoteQueryResult = await client.query(
              `SELECT * FROM lease_note WHERE lease_id = $1 ORDER BY created_at ASC`,
              [lease.id]
            );
            for (const noteRow of leaseNoteQueryResult.rows) {
              lease.addLeaseNote(LeaseNote.fromRow(noteRow));
            }

            const leaseEventQueryResult = await client.query(
              `SELECT * FROM lease_event WHERE lease_id = $1 ORDER BY due_date ASC`,
              [lease.id]
            );
            for (const eventRow of leaseEventQueryResult.rows) {
              lease.addLeaseEvent(LeaseEvent.fromRow(eventRow));
            }
            unit.addLease(lease);
          }
          building.addUnit(unit);
        }

        buildings.push(building);
      }
      return buildings;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  },
};

module.exports = {
  BuildingQueries,
};
