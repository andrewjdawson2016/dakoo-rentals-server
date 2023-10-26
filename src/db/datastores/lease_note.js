const { pool } = require("../conn");

const LeaseNoteQueries = {
  insert: async (leaseId, note) => {
    try {
      const result = await pool.query(
        `INSERT INTO lease_note (lease_id, note) VALUES ($1, $2) RETURNING id;`,
        [leaseId, note]
      );
      return null;
    } catch (error) {
      console.error(error);
      return error;
    }
  },

  delete: async (id) => {
    try {
      await pool.query(`DELETE FROM lease_note WHERE id = $1;`, [id]);
      return null;
    } catch (error) {
      console.error(error);
      return error;
    }
  },
};

module.exports = {
  LeaseNoteQueries,
};
