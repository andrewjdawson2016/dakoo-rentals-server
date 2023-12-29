const { pool } = require("../conn");
const { User, NotFoundError } = require("./types");

const UserQueries = {
  getByEmail: async (email) => {
    try {
      const userQueryResult = await pool.query(
        "SELECT id, email, password, first_name, last_name FROM user WHERE email = $1",
        [email]
      );
      if (userQueryResult.rows.length === 0) {
        throw new NotFoundError("Failed to find user with email: ", email);
      }
      return User.fromRow(userQueryResult.rows[0]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  getById: async (id) => {
    try {
      const userQueryResult = await pool.query(
        "SELECT id, email, password, first_name, last_name FROM user WHERE id = $1",
        [id]
      );
      if (userQueryResult.rows.length === 0) {
        throw new NotFoundError("Failed to find user with id: ", id);
      }
      return User.fromRow(userQueryResult.rows[0]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

module.exports = {
  UserQueries,
};
