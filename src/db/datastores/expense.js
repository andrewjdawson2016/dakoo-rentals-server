const { QueryHelpers } = require("./util");

const ExpenseQueries = {
  delete: (id) => {
    return QueryHelpers.delete(`DELETE FROM expense WHERE id = $1`, [id]);
  },

  insert: async (buildingId, monthYear, amount, note) => {
    return QueryHelpers.insert(
      `INSERT INTO expense (building_id, month_year, amount, note) VALUES ($1, $2, $3, $4)`,
      [buildingId, monthYear, amount, note],
      "expense already exists"
    );
  },
};

module.exports = {
  ExpenseQueries,
};
