const { Property, Lease, LeaseEvent, LeaseNote, Tenant } = require("./types");
const { pool } = require("../conn");

const PropertyQueries = {
  delete: async (id) => {
    return pool.query("DELETE FROM property WHERE id = $1", [id]);
  },
  insert: async (address) => {
    return pool.query("INSERT INTO property (address) VALUES ($1)", [address]);
  },
  list: async () => {
    const properties = [];
    const selectPropertiesResult = await pool.query(
      "SELECT * FROM property ORDER BY address ASC"
    );
    for (const propertyRow of selectPropertiesResult.rows) {
      const property = Property.fromRow(propertyRow);
      const leaseQueryResult = await pool.query(
        "SELECT * from lease WHERE property_id = $1 ORDER BY start_date DESC",
        [propertyRow.id]
      );
      for (const leaseRow of leaseQueryResult.rows) {
        const lease = Lease.fromRow(leaseRow);

        const tenantLeaseQueryResult = await pool.query(
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

        const leaseNoteQueryResult = await pool.query(
          "SELECT * FROM lease_note WHERE lease_id = $1 ORDER BY created_at ASC",
          [lease.id]
        );
        for (const noteRow of leaseNoteQueryResult.rows) {
          lease.addLeaseNote(LeaseNote.fromRow(noteRow));
        }

        const leaseEventQueryResult = await pool.query(
          "SELECT * FROM lease_event WHERE lease_id = $1 ORDER BY due_date ASC",
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
  },
};

module.exports = {
  PropertyQueries,
};
