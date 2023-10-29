const { Property, Lease, LeaseEvent, LeaseNote, Tenant } = require("./types");
const { pool } = require("../conn");
const { QueryHelpers } = require("./util");

const PropertyQueries = {
  delete: (id) => {
    return QueryHelpers.delete(`DELETE FROM property WHERE id = $1`, [id]);
  },
  insert: (address) => {
    return QueryHelpers.insert(
      `INSERT INTO property (address) VALUES ($1)`,
      [address],
      `address already exists`
    );
  },
  list: async () => {
    const client = await pool.connect();
    try {
      const properties = [];
      const selectPropertiesResult = await client.query(
        `SELECT * FROM property ORDER BY address ASC`
      );
      for (const propertyRow of selectPropertiesResult.rows) {
        const property = Property.fromRow(propertyRow);
        const leaseQueryResult = await client.query(
          `SELECT * from lease WHERE property_id = $1 ORDER BY start_date DESC`,
          [propertyRow.id]
        );
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
          property.addLease(lease);
        }
        properties.push(property);
      }
      return properties;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  },
};

module.exports = {
  PropertyQueries,
};
