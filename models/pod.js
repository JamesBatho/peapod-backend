"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/* Related functions for pods */

class Pod {
  /* Create a new pod, add current user id to pod, return new pod id

    data should be {userid}

    returns { podId, userId0} */

  static async create({ name, userId0 }) {
    const result = await db.query(
      `INSERT INTO pods
            (name, user_id0)
            VALUES ($1, $2)
            RETURNING name, user_id0 as "userId0"`,
      [name, userId0]
    );
    const pod = result.rows[0];

    return pod;
  }

  /** Update pod data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include any user id
   *
   * Returns {name, ...userids}
   *
   * Throws NotFoundError if not found.
   */

  static async update(name, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      userId0: "user_id0",
      userId1: "user_id1",
      userId2: "user_id2",
      userId3: "user_id3",
    });
    const nameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE pods 
                          SET ${setCols} 
                          WHERE name = ${nameVarIdx} 
                          RETURNING  
                          name,
                          user_id0 as "userId0", user_id1 as "userId1"`;
    const result = await db.query(querySql, [...values, name]);
    const pod = result.rows[0];

    if (!pod) throw new NotFoundError(`No pod: ${name}`);

    return pod;
  }

  /** Delete given pod from database; returns undefined.
   *
   * Throws NotFoundError if pod not found.
   **/

  static async remove(name) {
    const result = await db.query(
      `DELETE
               FROM pods
               WHERE name = $1
               RETURNING name`,
      [name]
    );
    const pod = result.rows[0];

    if (!pod) throw new NotFoundError(`No pod: ${id}`);
  }
}
module.exports = Pod;
