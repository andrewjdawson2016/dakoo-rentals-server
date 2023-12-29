const express = require("express");
const bcrypt = require("bcrypt");
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
  return res.send("Logged in successfully");
});

router.post("/logout", (req, res) => {
  req.logout();
  return res.send("Logged out successfully");
});

module.exports = {
  router,
};
