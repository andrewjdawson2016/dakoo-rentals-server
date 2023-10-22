const express = require("express");
const { PropertyQueries } = require("../db/datastores/property");
const Joi = require("@hapi/joi");

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

router.post("/", (req, res) => {
  const { error } = validateNewProperty(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  PropertyQueries.insert(req.body.address)
    .then(() => {
      res.status(201).json({
        message: "Property added successfully",
      });
    })
    .catch((err) => {
      console.error("Error executing query", err.stack);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await PropertyQueries.delete(id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const properties = await PropertyQueries.list();
    res.status(200).json(properties);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  router,
  validateNewProperty,
};
