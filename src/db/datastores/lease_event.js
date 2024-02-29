const { pool } = require("../conn");
const { NotFoundError } = require("./types");

const LeaseEventQueries = {
  setExecutionDate: async (id, executionDate, note, userId) => {
    try {
      const result = await pool.query(
        `UPDATE lease_event SET execution_date = $1, note = $2 WHERE id = $3 AND user_id = $4 RETURNING id, execution_date;`,
        [executionDate, note, id, userId]
      );
      if (result.rows.length === 0) {
        return new NotFoundError(`lease event not found.`);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

module.exports = {
  LeaseEventQueries,
};
