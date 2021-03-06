"use strict";

/** Routes for pods. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Pod = require("../models/pod");
const podNewSchema = require("../schemas/podNew.json");
const podUpdateSchema = require("../schemas/podUpdate.json");
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
    console.log(req.body);
    const validator = jsonschema.validate(req.body, podNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const pod = await Pod.create({ ...req.body });
    return res.status(201).json({ pod });
  } catch (err) {
    return next(err);
  }
});

/** PATCH / { fld1, fld2, ... } => {  }
 *
 * Data can include: { userId0, userId1 }
 *
 *
 *
 */

router.patch("/:name", async function (req, res, next) {
  try {
    console.log("name", req.params.name);
    console.log("data", JSON.stringify(req.body));
    const validator = jsonschema.validate(req.body, podUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    console.log("name", req.params.name);
    console.log("data", JSON.stringify(req.body));
    const pod = await Pod.update(req.params.name, req.body);
    return res.json({ pod });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:name", async function (req, res, next) {
  try {
    await Pod.remove(req.params.name);
    return res.json({ deleted: req.params.name });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
