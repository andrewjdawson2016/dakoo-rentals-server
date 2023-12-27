const express = require("express");
const { ExpenseQueries } = require("../db/datastores/expense");
const Joi = require("@hapi/joi");
const { parseDatabaseError } = require("./common");

const router = express.Router();

const expenseSchema = Joi.object({
  building_id: Joi.number().positive().required().messages({
    "number.base": "Invalid building_id.",
    "number.positive": "Invalid building_id.",
    "any.required": "building_id is required.",
  }),
  month_year: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "month_year must be in YYYY-MM format.",
      "any.required": "month_year is required.",
    }),
  fixed_amount: Joi.number().min(0).required().messages({
    "number.base": "Invalid fixed_amount.",
    "number.min": "fixed_amount cannot be negative.",
    "any.required": "fixed_amount is required.",
  }),
  variable_amount: Joi.number().min(0).required().messages({
    "number.base": "Invalid variable_amount.",
    "number.min": "variable_amount cannot be negative.",
    "any.required": "variable_amount is required.",
  }),
  note: Joi.string().allow(""),
});

function validateNewExpense(body) {
  return expenseSchema.validate(body);
}

router.post("/", async (req, res) => {
  let { error } = validateNewExpense(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  try {
    await ExpenseQueries.insert(
      req.body.building_id,
      req.body.month_year,
      req.body.fixed_amount,
      req.body.variable_amount,
      req.body.note
    );
    return res.status(201).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to create expense: ${message}` });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await ExpenseQueries.delete(id);
    return res.status(204).send();
  } catch (e) {
    const { message, status } = parseDatabaseError(e);
    return res
      .status(status)
      .json({ error: `Failed to delete expense: ${message}` });
  }
});

module.exports = {
  router,
  validateNewExpense,
};
