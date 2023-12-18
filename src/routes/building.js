const express = require("express");
const { BuildingQueries } = require("../db/datastores/building");
const Joi = require("@hapi/joi");
const { parseDatabaseError } = require("./common");

const router = express.Router();

const buildingSchema = Joi.object({
  address: Joi.string().max(255).required().messages({
    "string.base": "Invalid address format.",
    "string.max": "Address must not exceed 255 characters.",
    "any.required": "Address is required.",
  }),
  nickname: Joi.string().max(255).required().messages({
    "string.base": "Invalid nickname format.",
    "string.max": "Nickname must not exceed 255 characters.",
    "any.required": "Nickname is required.",
  }),
  building_type: Joi.string()
    .valid("SINGLE_FAMILY", "MULTI_FAMILY")
    .required()
    .messages({
      "string.base": "Invalid building type format.",
      "any.only":
        "Building type must be either 'SINGLE_FAMILY' or 'MULTI_FAMILY'.",
      "any.required": "Building type is required.",
    }),
  unit_numbers: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[A-Za-z0-9]+$/)
        .messages({
          "string.pattern.base":
            "Each unit must consist of uppercase and lowercase letters and/or digits.",
        })
    )
    .when("building_type", {
      is: "SINGLE_FAMILY",
      then: Joi.array().empty().messages({
        "array.empty":
          "Unit numbers must be an empty array for a SINGLE_FAMILY building type.",
      }),
      otherwise: Joi.array().min(1).messages({
        "array.min":
          "Unit numbers must contain at least one unit for a MULTI_FAMILY building type.",
      }),
    })
    .messages({
      "array.base": "Invalid format for unit numbers.",
    }),
});

function validateNewBuilding(body) {
  return buildingSchema.validate(body);
}

router.get("/", async (req, res) => {
  try {
    const buildings = await BuildingQueries.list();
    return res.status(200).json({ buildings: buildings });
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to list buildings: ${message}` });
  }
});

router.post("/", async (req, res) => {
  let { error } = validateNewBuilding(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  try {
    await BuildingQueries.insert(
      req.body.address,
      req.body.nickname,
      req.body.building_type,
      req.body.unit_numbers
    );
    return res.status(201).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to create building: ${message}` });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await BuildingQueries.delete(id);
    return res.status(204).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to delete building: ${message}` });
  }
});

module.exports = {
  router,
  validateNewBuilding,
};
