"use strict";

/** Routes for child. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Child = require("../models/child");
const childNewSchema = require("../schemas/childNew.json");
const childUpdateSchema = require("../schemas/childUpdate.json");
// const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

/** POST / { child } => { child }
 *
 * child should be { userId0 }
 *
 * Returns { id, userId0 }
 *
 * Authorization required: none
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, childNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const child = await Child.create(req.body);
    return res.status(201).json({ child });
  } catch (err) {
    return next(err);
  }
});

// /** PATCH /[childId]  { fld1, fld2, ... } => { job }
//  *
//  */

router.patch("/:id", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, childUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Child.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: id }
 *
 */

router.delete("/:id", async function (req, res, next) {
  try {
    await Child.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
