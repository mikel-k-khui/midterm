DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS users_lists CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

CREATE TABLE users (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  full_name varchar,
  email varchar,
  created_at timestamp NOT NULL,
  password varchar
);


CREATE TABLE tasks (
  id SERIAL UNIQUE PRIMARY KEY NOT NULL,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  last_modified timestamp NOT NULL,
  description varchar NOT NULL,
  category varchar NOT NULL,
  active Boolean NOT NULL DEFAULT true
);
