const { QueryHelpers } = require("./util");

const LeaseNoteQueries = {
  insert: (leaseId, note, userId) => {
    return QueryHelpers.insert(
      `INSERT INTO lease_note (lease_id, note, user_id) VALUES ($1, $2, $3)`,
      [leaseId, note, userId],
      "lease note already exists"
    );
  },

  delete: (id, userId) => {
    return QueryHelpers.delete(
      `DELETE FROM lease_note WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },
};

module.exports = {
  LeaseNoteQueries,
};
