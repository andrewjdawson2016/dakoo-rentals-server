const { QueryHelpers } = require("./util");

const TenantQueries = {
  delete: (id, userId) => {
    return QueryHelpers.delete(
      `DELETE FROM tenant WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },
};

module.exports = {
  TenantQueries,
};
