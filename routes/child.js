"use strict";

/** Routes for childs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Pod = require("../models/pod");
const podNewSchema = require("../schemas/podNew.json");
const podUpdateSchema = require("../schemas/podUpdate.json");
// const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

/** POST / { pod } => { pod }
 *
 * pod should be { userId0 }
 *
 * Returns { id, userId0 }
 *
 * Authorization required: none
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, podNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const pod = await Pod.create(req.body);
    return res.status(201).json({ pod });
  } catch (err) {
    return next(err);
  }
});

// /** PATCH /[jobId]  { fld1, fld2, ... } => { job }
//  *
//  * Data can include: { title, salary, equity }
//  *
//  * Returns { id, title, salary, equity, companyHandle }
//  *
//  * Authorization required: admin
//  */

// router.patch("/:id", async function (req, res, next) {
//   try {
//     const validator = jsonschema.validate(req.body, podUpdateSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map((e) => e.stack);
//       throw new BadRequestError(errs);
//     }

//     const job = await Job.update(req.params.id, req.body);
//     return res.json({ job });
//   } catch (err) {
//     return next(err);
//   }
// });

// /** DELETE /[handle]  =>  { deleted: id }
//  *
//  * Authorization required: admin
//  */

// router.delete("/:id", ensureAdmin, async function (req, res, next) {
//   try {
//     await Job.remove(req.params.id);
//     return res.json({ deleted: +req.params.id });
//   } catch (err) {
//     return next(err);
//   }
// });

module.exports = router;
