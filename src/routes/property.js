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

router.post("/", async (req, res) => {
  let { err } = validateNewProperty(req.body);

  if (err) {
    return res.status(400).json({
      error: err.details[0].message,
    });
  }

  err = await PropertyQueries.insert(req.body.address);
  if (err) {
    return res.status(500).json({ error: InternalServiceErrorMsg });
  }
  return res.status(201).send();
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const err = await PropertyQueries.delete(id);
  if (err) {
    return res.status(500).json({ error: InternalServiceErrorMsg });
  }
  return res.status(204).send();
});

router.get("/", async (req, res) => {
  const { properties, error } = await PropertyQueries.list();
  if (error) {
    return res.status(500).json({ error: InternalServiceErrorMsg });
  }
  return res.status(200).json({ properties: properties });
});

module.exports = {
  router,
  validateNewProperty,
};
