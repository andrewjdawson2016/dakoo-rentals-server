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
      return;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

module.exports = {
  UserQueries,
};

/**
 * const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async function(email, password, done) {
    try {
      const res = await pool.query('SELECT id, email, password, first_name, last_name FROM user WHERE email = $1', [email]);
      if (res.rows.length > 0) {
        const first = res.rows[0];
        const validPassword = await bcrypt.compare(password, first.password);

        if (validPassword) {
          done(null, { id: first.id, email: first.email, firstName: first.first_name, lastName: first.last_name });
        } else {
          done(null, false, { message: 'Incorrect password.' });
        }
      } else {
        done(null, false, { message: 'Incorrect email.' });
      }
    } catch (err) {
      done(err);
    }
  }
));

 */
