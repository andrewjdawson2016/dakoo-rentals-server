const express = require("express");
const { UnitQueries } = require("../db/datastores/unit");
const Joi = require("@hapi/joi");
const { parseDatabaseError } = require("./common");

const router = express.Router();

const unitSchema = Joi.object({
  building_id: Joi.number().positive().required().messages({
    "number.base": "Invalid building_id.",
    "number.positive": "Invalid building_id.",
    "any.required": "building_id is required.",
  }),
  unit_type: Joi.string()
    .valid("SINGLE_FAMILY", "MULTI_FAMILY")
    .required()
    .messages({
      "string.base": "Invalid unit_type.",
      "any.only": "unit_type must be either 'SINGLE_FAMILY' or 'MULTI_FAMILY'.",
      "any.required": "unit_type is required.",
    }),
  unit_number: Joi.string()
    .max(10)
    .when("unit_type", {
      is: "SINGLE_FAMILY",
      then: Joi.forbidden().messages({
        "any.unknown":
          "unit_number must not be provided for SINGLE_FAMILY units.",
      }),
      otherwise: Joi.required().messages({
        "any.required": "unit_number is required for MULTI_FAMILY units.",
        "string.base": "Invalid unit_number.",
        "string.max": "unit_number must not exceed 10 characters.",
      }),
    }),
});

function validateNewUnit(body) {
  return unitSchema.validate(body);
}

router.post("/", async (req, res) => {
  let { e } = validateNewUnit(req.body);

  if (e) {
    return res.status(400).json({
      error: e.details[0].message,
    });
  }

  try {
    await UnitQueries.insert(
      req.body.building_id,
      req.body.unit_type,
      req.body.unit_number
    );
    return res.status(201).send();
  } catch {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to create unit: ${message}` });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await UnitQueries.delete(id);
    return res.status(204).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to delete unit: ${message}` });
  }
});

module.exports = {
  router,
  validateNewUnit,
};
