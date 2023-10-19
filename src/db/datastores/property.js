const { Property } = require("./types");
const { Pool } = require("../conn");

const PropertyQueries = {
    getAllProperties: async () => {
        const result = await Pool.query('SELECT * FROM property');
        return result.rows.map(row => Property.fromRow(row));
    },
    insertProperty: async (address) => {
        return Pool.query('INSERT INTO property (address) VALUES ($1)', [address]);
    },
    deletePropertyById: async (id) => {
        return Pool.query('DELETE FROM property WHERE id = $1', [id]);
    },
    getPropertyById: async (id) => {
        const result = await Pool.query('SELECT * FROM property WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        return Property.fromRow(result.rows[0]);
    }
}

module.exports = {
    PropertyQueries
};
