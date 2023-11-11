const express = require("express");
const { LeaseEventQueries } = require("../db/datastores/lease_event");
const Joi = require("@hapi/joi");
const { DateTime } = require("luxon");
const { parseDatabaseError } = require("./common");

const router = express.Router();

const leaseEventSchema = Joi.object({
  id: Joi.number().positive().required().messages({
    "number.base": "Invalid id.",
    "number.positive": "Invalid id.",
    "any.required": "id is required.",
  }),
  execution_date: Joi.string()
    .allow("", null)
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      if (value && !DateTime.fromISO(value).isValid) {
        return helpers.error("date.invalid");
      }
      return value;
    })
    .messages({
      "string.pattern.base": "execution_date must be in YYYY-MM-DD format.",
      "any.required": "execution_date is required.",
      "date.invalid": "execution_date is not a valid date.",
    }),
});

function validateNewLeaseEvent(body) {
  return leaseEventSchema.validate(body);
}

router.patch("/", async (req, res) => {
  const { error, value } = validateNewLeaseEvent(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  let { id, execution_date } = value;

  execution_date = execution_date === "" ? null : execution_date;

  try {
    await LeaseEventQueries.setExecutionDate(id, execution_date);
    return res.status(200).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to update lease event: ${message}` });
  }
});

module.exports = {
  router,
};
