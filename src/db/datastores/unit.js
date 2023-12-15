const { QueryHelpers } = require("./util");

const UnitQueries = {
  delete: (id) => {
    return QueryHelpers.delete(`DELETE FROM unit WHERE id = $1`, [id]);
  },
  insert: (buildingId, unitType, unitNumber) => {
    return QueryHelpers.insert(
      `INSERT INTO unit (building_id, unit_type, unit_number) VALUES ($1, $2, $3)`,
      [buildingId, unitType, unitNumber],
      `unit already exists`
    );
  },
};

module.exports = {
  UnitQueries,
};
