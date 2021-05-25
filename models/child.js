"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/* Related functions for children */

class Child {
  /* Create a new child, add current user id to child, return new child id

    data should be {userid}

    returns { childid, user1id} */

  static async create({ name, age, allergies, likes, parentId }) {
    const result = await db.query(
      `INSERT INTO children
            (name, age, allergies, likes, parent_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, age, parent_id as parentId`,
      [name, age, allergies, likes, parentId]
    );
    const child = result.rows[0];

    return child;
  }

  /** Update child data with `data`.
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

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      name: "name",
      age: "age",
      allergies: "allergies",
      likes: "likes",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE children 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING  
                          name,
                          age`;
    const result = await db.query(querySql, [...values, id]);
    const child = result.rows[0];

    if (!child) throw new NotFoundError(`No child: ${id}`);

    return child;
  }

  /** Delete given child from database; returns undefined.
   *
   * Throws NotFoundError if child not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
               FROM children
               WHERE id = $1
               RETURNING name`,
      [id]
    );
    const child = result.rows[0];

    if (!child) throw new NotFoundError(`No child: ${id}`);
  }
}

module.exports = Child;
