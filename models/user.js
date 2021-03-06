"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users- authentication and CRUD */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    address, 
                    is_admin AS "isAdmin"

             FROM users
             WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    address,
    isAdmin,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
             FROM users
             WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
             (username,
              password,
              first_name,
              last_name,
              email,
              address,
              is_admin)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING username, first_name AS "firstName", last_name AS "lastName", email, address, is_admin as "isAdmin"`,
      [username, hashedPassword, firstName, lastName, email, address, isAdmin]
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email, 
                    address
             FROM users
             ORDER BY username`
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, email, address, is_admin, pod, appointments }
   *   where appointments are the appointments that the user has created
   * and pod is the users pod
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    address
             FROM users
             WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    // adding pod to user

    const userPodRes = await db.query(
      `SELECT name, user_id0 AS "userId0", user_id1 AS "userId1"
          FROM pods AS p
          WHERE p.user_id0 = $1 OR p.user_id1 = $1 OR p.user_id2 = $1 OR p.user_id3 = $1`,
      [username]
    );
    if (userPodRes.rows.length == 0) {
      console.log("no Pod");
    }

    if (userPodRes.rows.length !== 0) {
      user.pod = userPodRes.rows[0];
    }

    user.pod = userPodRes.rows[0];
    if (userPodRes.rows.length == 0) console.log("no pod");

    // adding appointments to user

    // thoughts- should appointments live under their pod or their creator
    const userAppointmentsRes = await db.query(
      `SELECT *
             FROM appointments AS a
             WHERE a.creator_id = $1`,
      [username]
    );

    if (userAppointmentsRes.rows.length == 0) console.log("no appointments");

    user.appointments = userAppointmentsRes.rows.map((a) => {
      return { id: a.id, isHost: a.isHost, description: a.description };
    });

    // adding children to user

    const userChildRes = await db.query(
      `SELECT id, name, age, allergies, likes 
      FROM children AS c
      WHERE c.parent_id = $1`,
      [username]
    );

    user.children = userChildRes.rows.map((c) => {
      return {
        id: c.id,
        name: c.name,
        age: c.age,
        allergies: c.allergies,
        likes: c.likes,
      };
    });

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                        SET ${setCols} 
                        WHERE username = ${usernameVarIdx} 
                        RETURNING username,
                                  first_name AS "firstName",
                                  last_name AS "lastName",
                                  email, 
                                  address, 
                                  is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
             FROM users
             WHERE username = $1
             RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}

module.exports = User;
