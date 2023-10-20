const { pool } = require("../conn");

const TenantQueries = {
  deleteTenant: async (tenantId) => {
    try {
      const deleteQuery = `DELETE FROM tenant WHERE id = $1 RETURNING id;`;
      const result = await pool.query(deleteQuery, [tenantId]);

      if (result.rows.length === 0) {
        throw new Error(`Tenant with ID ${tenantId} not found.`);
      }

      return result.rows[0].id;
    } catch (error) {
      console.error("Error deleting tenant:", error);
      throw error;
    }
  },
};

module.exports = {
  TenantQueries,
};
