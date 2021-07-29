const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testJobIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM pods");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM appointments");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM children");

  await db.query(
    `
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email,address)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com','A1'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com','A2')
        RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );

  await db.query(`
    INSERT INTO pods(name, user_id0, user_id1)
    VALUES ('P1', 'u1, 'u2')
    RETURNING name
  `);

  await db.query(`
  INSET INTO children(name, age, parent_id)
  VALUES ('C1', 1, 'u1')
  RETURNING (id, parent_id)`);

  const appointments = await db.query(`
    INSERT INTO appointments(is_host, description, child_slots, start_time, end_time, creator_id)
    VALUES ('true', 'test', 2, now(), now(), 'u1' ), ('false', 'test2', 2, now(), now(), 'u1' ) 
    RETURNING (id, creator_id)
  `);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
