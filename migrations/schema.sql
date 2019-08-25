-- Comment out existing data
DROP TABLE IF EXISTS widgets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS list CASCADE;
DROP TABLE IF EXISTS users_lists CASCADE;
DROP TABLE IF EXISTS task CASCADE;

CREATE TABLE users (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  full_name varchar,
  email varchar,
  created_at timestamp NOT NULL,
  password varchar
);

CREATE TABLE list (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  name varchar NOT NULL,
  description varchar,
  category varchar NOT NULL DEFAULT 'eat'
);

CREATE TABLE users_lists (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  created_by int REFERENCES users(id) ON DELETE CASCADE,
  list_id int REFERENCES list(id) ON DELETE CASCADE,
  user_id int REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE task (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  list_id int REFERENCES list(id) ON DELETE CASCADE,
  last_modified timestamp NOT NULL,
  description varchar NOT NULL,
  active Boolean NOT NULL DEFAULT true
);
