"use strict";

/** Routes for appointments. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Appointment = require("../models/appointment");
const appointmentNewSchema = require("../schemas/appointmentNew.json");
const appointmentUpdateSchema = require("../schemas/appointmentUpdate.json");
// const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

/** POST / { appointment } => { appointment }
 *
 * appointment should be { userId0 }
 *
 * Returns { id, userId0 }
 *
 * Authorization required: none
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, appointmentNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const appointment = await Appointment.create(req.body);
    return res.status(201).json({ appointment });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[jobId]  { fld1, fld2, ... } => { job }
 *
 * Data can include: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, appointmentUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:id", async function (req, res, next) {
  try {
    await Appointment.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
