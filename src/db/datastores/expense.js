const { QueryHelpers } = require("./util");

const ExpenseQueries = {
  delete: (id, userId) => {
    return QueryHelpers.delete(
      `DELETE FROM expense WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },

  insert: async (buildingId, monthYear, amount, note, userId) => {
    return QueryHelpers.insert(
      `INSERT INTO expense (building_id, month_year, amount, note, user_id) VALUES ($1, $2, $3, $4, $5)`,
      [buildingId, monthYear, amount, note, userId],
      "expense already exists"
    );
  },
};

module.exports = {
  ExpenseQueries,
};
