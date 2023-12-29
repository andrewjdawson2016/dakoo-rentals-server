const express = require("express");
const bodyParser = require("body-parser");
const routers = require("./routes");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { UserQueries } = require("./db/datastores/user");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: "auto" },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      try {
        const user = await UserQueries.getByEmail(email);
        const validPassword = await bcrypt.compare(password, user.password);

        if (validPassword) {
          done(null, {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          });
        } else {
          done(null, false, { message: "Incorrect password." });
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserQueries.getById(id);
    done(null, {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  } catch (err) {
    done(err);
  }
});

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("User not authenticated");
};

app.use("/buildings", ensureAuthenticated, routers.buildingsRouter);
app.use("/leases", ensureAuthenticated, routers.leasesRouter);
app.use("/expenses", ensureAuthenticated, routers.expensesRouter);
app.use("/tenants", ensureAuthenticated, routers.tenantRouter);
app.use("/lease_notes", ensureAuthenticated, routers.leaseNoteRouter);
app.use("/lease_events", ensureAuthenticated, routers.leaseEventRouter);
app.use("/users", ensureAuthenticated, routers.usersRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
