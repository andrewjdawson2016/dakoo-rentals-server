const { pool } = require("../conn");
const { QueryHelpers } = require("./util");
const { Building, NotFoundError, ValidationError } = require("./types");

const ExpenseQueries = {
  delete: (id, userId) => {
    return QueryHelpers.delete(
      `DELETE FROM expense WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },

  insert: async (buildingId, monthYear, amount, note, userId) => {
    const client = await pool.connect();
    try {
      await client.query(`BEGIN`);
      const buildingQueryResult = await client.query(
        `SELECT * FROM building WHERE id = $1 AND user_id = $2`,
        [buildingId, userId]
      );
      if (buildingQueryResult.rows.length === 0) {
        throw new NotFoundError(
          "Failed to find building with id: ",
          buildingId
        );
      }

      const buildingRow = buildingQueryResult.rows[0];
      const building = Building.fromRow(buildingRow);

      if (monthYear < building.first_rental_month) {
        throw new ValidationError(
          "Provided expense month comes before building first rental month"
        );
      }
      QueryHelpers.insertWithClient(
        client,
        `INSERT INTO expense (building_id, month_year, amount, note, user_id) VALUES ($1, $2, $3, $4, $5)`,
        [buildingId, monthYear, amount, note, userId],
        "expense already exists"
      );
      await client.query(`COMMIT`);
    } catch (e) {
      console.error(e);
      await client.query(`ROLLBACK`);
      throw e;
    } finally {
      client.release();
    }
  },
};

module.exports = {
  ExpenseQueries,
};
