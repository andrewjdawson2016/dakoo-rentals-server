const { pool } = require("../conn");

const TenantQueries = {
  delete: async (id) => {
    try {
      await pool.query(`DELETE FROM tenant WHERE id = $1;`, [id]);
      return null;
    } catch (error) {
      console.error(error);
      return error;
    }
  },
};

module.exports = {
  TenantQueries,
};
