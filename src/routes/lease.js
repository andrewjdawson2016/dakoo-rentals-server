const express = require("express");
const { LeaseQueries } = require("../db/datastores/lease");
const Joi = require("@hapi/joi");
const { DateTime } = require("luxon");

const router = express.Router();

const leaseSchema = Joi.object({
  property_id: Joi.number().positive().required().messages({
    "number.base": "Invalid property_id.",
    "number.positive": "Invalid property_id.",
    "any.required": "property_id is required.",
  }),
  start_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "start_date must be in YYYY-MM-DD format.",
      "any.required": "start_date is required.",
    }),
  end_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "end_date must be in YYYY-MM-DD format.",
      "any.required": "end_date is required.",
    }),
  price_per_month: Joi.number().positive().required().messages({
    "number.base": "Invalid price_per_month.",
    "number.positive": "Invalid price_per_month.",
    "any.required": "price_per_month is required.",
  }),
  is_renewal: Joi.boolean().required().messages({
    "boolean.base": "is_renewal must be a boolean.",
    "any.required": "is_renewal is required.",
  }),
  note: Joi.string().optional(),
  tenants: Joi.when("is_renewal", {
    is: true,
    then: Joi.any().forbidden(),
    otherwise: Joi.array()
      .min(1)
      .items(
        Joi.object({
          name: Joi.string()
            .pattern(/^[A-Z][a-z]+ [A-Z][a-z]+$/)
            .required(),
          email: Joi.string().email().required(),
        }).required()
      )
      .required(),
  }),
});

function validateNewLease(body) {
  const validationResult = leaseSchema.validate(body);

  if (validationResult.error) {
    return validationResult;
  }

  if (
    DateTime.fromISO(body.start_date).plus({ months: 1 }) >
    DateTime.fromISO(body.end_date)
  ) {
    return {
      error: {
        details: [
          {
            message:
              "start_date should come at least one month before end_date.",
          },
        ],
      },
    };
  }

  return validationResult;
}

router.post("/", (req, res) => {
  const { error } = validateNewLease(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  const {
    property_id,
    start_date,
    end_date,
    price_per_month,
    is_renewal,
    note,
    tenants,
  } = req.body;

  LeaseQueries.createLease(
    property_id,
    start_date,
    end_date,
    price_per_month,
    is_renewal,
    note,
    tenants
  )
    .then((leaseId) => {
      res.status(201).json({ message: "Lease created successfully.", leaseId });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await LeaseQueries.deleteLeaseById(id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Lease not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  router,
  validateNewLease,
};
