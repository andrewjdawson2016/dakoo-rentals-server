const { pool } = require("../conn");
const { AlreadyExistsError } = require("./types");

const QueryHelpers = {
  delete: async (queryString, values) => {
    try {
      await pool.query(queryString, values);
      return null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  insert: (queryString, values, alreadyExistsErrMessage) => {
    return QueryHelpers.insertWithClient(
      pool,
      queryString,
      values,
      alreadyExistsErrMessage
    );
  },
  insertWithClient: async (
    client,
    queryString,
    values,
    alreadyExistsErrMessage
  ) => {
    try {
      return await client.query(queryString, values);
    } catch (e) {
      console.error(e);
      if (e.code === "23505") {
        throw new AlreadyExistsError(alreadyExistsErrMessage);
      }
      throw e;
    }
  },
};

module.exports = {
  QueryHelpers,
};
