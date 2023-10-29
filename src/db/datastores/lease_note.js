const { QueryHelpers } = require("./util");

const LeaseNoteQueries = {
  insert: (leaseId, note) => {
    return QueryHelpers.insert(
      `INSERT INTO lease_note (lease_id, note) VALUES ($1, $2)`,
      [leaseId, note],
      "lease note already exists"
    );
  },

  delete: (id) => {
    return QueryHelpers.delete(`DELETE FROM lease_note WHERE id = $1`, [id]);
  },
};

module.exports = {
  LeaseNoteQueries,
};
