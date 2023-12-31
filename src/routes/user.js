const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { UserQueries } = require("../db/datastores/user");
const { parseDatabaseError } = require("./common");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await UserQueries.insert(
      req.body.email,
      hashedPassword,
      req.body.first_name,
      req.body.last_name
    );
    return res.status(201).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to create user: ${message}` });
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  if (req.user) {
    return res.json({
      message: "Logged in successfully",
      firstName: req.user.firstName,
      lastName: req.user.lastName,
    });
  } else {
    return res.status(401).json({ message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.send("Logged out successfully");
  });
});

module.exports = {
  router,
};
