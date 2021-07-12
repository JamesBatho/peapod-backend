"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/* Related functions for appointments */

class Appointment {
  /* Create a new appointment, add current user id to appointment, return new appointment id

    data should be {userid}

    returns { podid, user1id} */

  static async create({
    isHost,
    description,
    childSlots,
    startTime,
    endTime,
    creatorId,
  }) {
    const result = await db.query(
      `INSERT INTO appointments
            (is_host, description, child_slots, start_time, end_time, creator_id)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING name, user_id0 as "userId0"`,
      [isHost, description, childSlots, startTime, endTime, creatorId]
    );
    const appointment = result.rows[0];

    return appointment;
  }

  /** Allow a user to get the appointments they have created */

  static async getAppts(creatorId) {
    `SELECT * FROM appointments 
    WHERE creator_id = ${creatorId}
    
    `;
  }

  /** Update appointment data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include any user info about the appointment
   *
   * Returns {name, ...userids}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      isHost: "is_host",
      description: "description",
      childSlots: "child_slots",
      startTime: "start_time",
      endTime: "endTime",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE appointments 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING  
                          id, is_host as "isHost"`;
    const result = await db.query(querySql, [...values, id]);
    const appointment = result.rows[0];

    if (!appointment) throw new NotFoundError(`No appointment: ${id}`);

    return appointment;
  }

  /** Delete given appointment from database; returns undefined.
   *
   * Throws NotFoundError if appointment not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
               FROM appointments
               WHERE id = $1
               RETURNING id`,
      [id]
    );
    const appointment = result.rows[0];

    if (!appointment) throw new NotFoundError(`No appointment: ${id}`);
  }
}

module.exports = Appointment;
