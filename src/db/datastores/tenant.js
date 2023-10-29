const { QueryHelpers } = require("./util");

const TenantQueries = {
  delete: (id) => {
    return QueryHelpers.delete(`DELETE FROM tenant WHERE id = $1`, [id]);
  },
};

module.exports = {
  TenantQueries,
};
