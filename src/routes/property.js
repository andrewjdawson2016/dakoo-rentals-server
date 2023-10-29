const express = require("express");
const { PropertyQueries } = require("../db/datastores/property");
const Joi = require("@hapi/joi");
const { parseDatabaseError } = require("./common");

const router = express.Router();

const addressSchema = Joi.object({
  address: Joi.string()
    .min(10)
    .regex(/^(?=.*[0-9])(?=.*[a-zA-Z]).*$/, "digit and character")
    .required()
    .messages({
      "string.min": "Address must be at least 10 characters long.",
      "string.regex.no-all-digits":
        "Address must contain at least one digit and one character.",
      "any.required": "Address is required.",
    }),
});

function validateNewProperty(body) {
  return addressSchema.validate(body);
}

router.post("/", async (req, res) => {
  let { e } = validateNewProperty(req.body);

  if (e) {
    return res.status(400).json({
      error: e.details[0].message,
    });
  }

  try {
    await PropertyQueries.insert(req.body.address);
    return res.status(201).send();
  } catch {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to create property: ${message}` });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await PropertyQueries.delete(id);
    return res.status(204).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to delete property: ${message}` });
  }
});

router.get("/", async (req, res) => {
  try {
    const properties = await PropertyQueries.list();
    return res.status(200).json({ properties: properties });
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to list properties: ${message}` });
  }
});

module.exports = {
  router,
  validateNewProperty,
};
