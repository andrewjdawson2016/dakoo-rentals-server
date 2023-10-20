const { pool } = require("../conn");

const LeaseNoteQueries = {
  insertLeaseNote: async (leaseId, note) => {
    try {
      const insertQuery = `INSERT INTO lease_note (lease_id, note) VALUES ($1, $2) RETURNING id;`;
      const result = await pool.query(insertQuery, [leaseId, note]);
      return result.rows[0].id;
    } catch (error) {
      console.error("Error inserting lease note:", error);
      throw error;
    }
  },

  deleteLeaseNote: async (noteId) => {
    try {
      const deleteQuery = `DELETE FROM lease_note WHERE id = $1 RETURNING id;`;
      const result = await pool.query(deleteQuery, [noteId]);

      if (result.rows.length === 0) {
        throw new Error(`Lease note with ID ${noteId} not found.`);
      }
      return result.rows[0].id;
    } catch (error) {
      console.error("Error deleting lease note:", error);
      throw error;
    }
  },
};

module.exports = {
  LeaseNoteQueries,
};
