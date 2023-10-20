const { Property, Lease, LeaseEvent, LeaseNote, Tenant } = require("./types");
const { pool } = require("../conn");

const PropertyQueries = {
    insertProperty: async (address) => {
        return pool.query('INSERT INTO property (address) VALUES ($1)', [address]);
    },
    deletePropertyById: async (id) => {
        return pool.query('DELETE FROM property WHERE id = $1', [id]);
    },
    getAllProperties: async () => {
        const properties = [];
        const selectPropertiesResult = await pool.query('SELECT * FROM property');
        for (const propertyRow of selectPropertiesResult.rows) {
            const property = Property.fromRow(propertyRow);
            const leaseQueryResult = await pool.query('SELECT * from lease WHERE property_id = $1', [propertyRow.id]);
            for (const leaseRow of leaseQueryResult.rows) {
                const lease = Lease.fromRow(leaseRow);
                const leaseNoteQueryResult = await pool.query('SELECT * FROM lease_note WHERE lease_id = $1', [lease.id]);
                for (const noteRow of leaseNoteQueryResult.rows) {
                    lease.addLeaseNote(LeaseNote.fromRow(noteRow));
                }
    
                const leaseEventQueryResult = await pool.query('SELECT * FROM lease_event WHERE lease_id = $1', [lease.id]);
                for (const eventRow of leaseEventQueryResult.rows) {
                    lease.addLeaseEvent(LeaseEvent.fromRow(eventRow));
                }
                property.addLease(lease)
            }
            properties.push(property);
        }
    }
}

module.exports = {
    PropertyQueries
};
