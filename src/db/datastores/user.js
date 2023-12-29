const { pool } = require("../conn");
const { User, NotFoundError } = require("./types");
const { QueryHelpers } = require("./util");

const UserQueries = {
  getByEmail: async (email) => {
    try {
      const userQueryResult = await pool.query(
        "SELECT id, email, password, first_name, last_name FROM app_user WHERE email = $1",
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
        "SELECT id, email, password, first_name, last_name FROM app_user WHERE id = $1",
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
  insert: async (email, password, first_name, last_name) => {
    return QueryHelpers.insert(
      `INSERT INTO app_user (email, password, first_name, last_name) VALUES ($1, $2, $3, $4)`,
      [email, password, first_name, last_name],
      "user already exists"
    );
  },
};

module.exports = {
  UserQueries,
};
