const { pool } = require("../conn");

const LeaseEventQueries = {
    setExecutionDate: async(eventId, executionDate) => {
        try {
            const updateQuery = `UPDATE lease_event SET execution_date = $1 WHERE id = $2 RETURNING id, execution_date;`;
            const result = await pool.query(updateQuery, [executionDate, eventId]);
            if (result.rows.length === 0) {
                throw new Error(`Lease event with ID ${eventId} not found.`);
            }
            return result.rows[0];
        } catch (error) {
            console.error("Error setting execution date for lease event:", error);
            throw error;
        }
    }
}

module.exports = {
    LeaseEventQueries
}
