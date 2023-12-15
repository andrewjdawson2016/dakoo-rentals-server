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
  monthly_expenses: Joi.number().integer().min(0).required().messages({
    "number.base": "Invalid monthly_expenses format.",
    "number.integer": "Monthly expenses must be an integer.",
    "number.min": "Monthly expenses cannot be negative.",
    "any.required": "Monthly expenses are required.",
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
  let { e } = validateNewBuilding(req.body);

  if (e) {
    return res.status(400).json({
      error: e.details[0].message,
    });
  }

  try {
    await BuildingQueries.insert(req.body.address, req.body.monthly_expenses);
    return res.status(201).send();
  } catch {
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
