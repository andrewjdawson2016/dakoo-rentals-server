const { QueryHelpers } = require("./util");

const ExpenseQueries = {
  delete: (id) => {
    return QueryHelpers.delete(`DELETE FROM expense WHERE id = $1`, [id]);
  },

  insert: async (buildingId, monthYear, fixedAmount, variableAmount, note) => {
    return QueryHelpers.insert(
      `INSERT INTO expense (building_id, month_year, fixed_amount, variable_amount, note) VALUES ($1, $2, $3, $4, $5)`[
        (buildingId, monthYear, fixedAmount, variableAmount, note)
      ],
      "expense already exists"
    );
  },
};

module.exports = {
  ExpenseQueries,
};
