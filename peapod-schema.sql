CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT
);


CREATE TABLE pods (
      name PRIMARY KEY,
      user_id0 VARCHAR(25) REFERENCES users(username) ON DELETE SET NULL,
      user_id1 VARCHAR(25) REFERENCES users(username) ON DELETE SET NULL,
      user_id2 VARCHAR(25) REFERENCES users(username) ON DELETE SET NULL,
      user_id3 VARCHAR(25) REFERENCES users(username) ON DELETE SET NULL
);

CREATE TABLE children (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0),
    allergies TEXT,
    likes TEXT,
    parent_id VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE   
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    is_host BOOLEAN NOT NULL,
    description TEXT NOT NULL,
    child_slots INTEGER NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    creator_id VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE
);