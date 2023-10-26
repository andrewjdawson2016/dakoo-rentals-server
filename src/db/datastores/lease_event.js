const { pool } = require("../conn");
const { NotFoundError } = require("./types");

const LeaseEventQueries = {
  setExecutionDate: async (id, executionDate) => {
    try {
      const result = await pool.query(
        `UPDATE lease_event SET execution_date = $1 WHERE id = $2 RETURNING id, execution_date;`,
        [executionDate, id]
      );
      if (result.rows.length === 0) {
        return new NotFoundError(`Lease event not found.`);
      }
      return null;
    } catch (error) {
      console.error(error);
      return error;
    }
  },
};

module.exports = {
  LeaseEventQueries,
};
