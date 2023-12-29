const { pool } = require("../conn");
const { NotFoundError } = require("./types");

const LeaseEventQueries = {
  setExecutionDate: async (id, executionDate, userId) => {
    try {
      const result = await pool.query(
        `UPDATE lease_event SET execution_date = $1 WHERE id = $2 AND user_id = $3 RETURNING id, execution_date;`,
        [executionDate, id, userId]
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
