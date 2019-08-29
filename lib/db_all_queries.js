const db = require('./db');
const bcrypt = require('bcrypt');


/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  let user;
  const queryString = 'SELECT * from users where email = $1';
  const values = email;
  return db.query(queryString, [values])
    .then(res => {
      user = res.rows[0];
      if (user) {
        return user;
      }
      return null;
    })
    .catch(err => console.error('query error', err.stack));
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  let user;
  const queryString = 'SELECT * from users where id = $1';
  const values = id;
  return db.query(queryString, [values])
    .then(res => {
      user = res.rows[0];
      if (user) {
        return user;
      }
      return null;
    })
    .catch(err => console.error('query error', err.stack));
};
exports.getUserWithId = getUserWithId;

/**
 * Check if a user exists with a given username and password
 * @param {String} email
 * @param {String} password encrypted
 */
const login = function(email, password) {
  return getUserWithEmail(email)
    .then(user => {
      if (bcrypt.compareSync(password, user.password)) {
        return user;
      }
      return null;
    });
};
exports.login = login;

/**
 * Add a new user to the database.
 * @param {{full_name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user, guest) {
  const createdAt = new Date(Date.now());
  let params = [];
  let queryString = 'INSERT INTO users (full_name, email, created_at, password) VALUES ($1, $2, $3, $4) RETURNING *;';

  if (guest === 1) {
    queryString = 'INSERT INTO users (full_name, email, created_at, password) VALUES (NULL, NULL, $1, NULL) RETURNING *;';
    params = [createdAt.toUTCString()];
  } else {
    params = [user.fullname, user.email, createdAt.toUTCString(), user.password];
  }
  return db.query(queryString, params)
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};
exports.addUser = addUser;

/**
 * Add a guest user to the database (cookie already assigned)
 * @param {{full_name: string, password: string, email: string}} user
 * @param {guestUserID} The user ID to update
 * @return {Promise<{}>} A promise to the user.
 */
const convertGuestIntoUser = function(user, guestUserID) {
  const createdAt = new Date(Date.now());
  const queryString = 'UPDATE users SET full_name = $1, email = $2, created_at = $3, password = $4 WHERE id = $5 RETURNING *;';
  return db.query(queryString, [user.fullname, user.email, createdAt.toUTCString(), user.password, guestUserID])
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};
exports.convertGuestIntoUser = convertGuestIntoUser;

/**
 * Add a task to the database
 * @param {int} userID
 * @param {string} description
 * @param {string} category
 * @return {Promise<{}>} A promise to the user.
 */
const addTask = function(userID, description, category) {
  const createdAt = new Date(Date.now());
  const queryString = 'INSERT INTO tasks (user_id, last_modified, description, category) VALUES ($1, $2, $3, $4) RETURNING *;';
  return db.query(queryString, [userID, createdAt.toUTCString(), description, category])
    .then(res => res.rows[0])
    .catch(err => console.error('query error', err.stack));
};
exports.addTask = addTask;

/**
 * Get active tasks for a corresponding user in a given category
 * @param {int} user ID
 * @param {string} category
 * @return {Promise<{}>} A promise to the user.
 */
const getActiveTasksByCategory = function(userid, category) {
  const queryString = 'SELECT tasks.id, tasks.description, tasks.category, to_char(tasks.last_modified, \'Mon DD, YYYY\') AS last_modified FROM tasks JOIN users on user_id = users.id WHERE users.id = $1 AND category = $2 AND active = true ORDER BY tasks.last_modified DESC;';
  return db.query(queryString, [userid, category])
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
};
exports.getActiveTasksByCategory = getActiveTasksByCategory;

/**
 * Update task category for a corresponding user
 * @param {int} userid
 * @param {int} taskid
 * @param {string} fieldToUpdate
 * @param {string} newValue
 * @return {Promise<{}>} A promise to the user.
 */
const updateFieldOfTask = function(userid, taskid, fieldToUpdate, newValue) {
  let queryString;
  switch (fieldToUpdate) {
  case 'category':
    queryString = 'UPDATE tasks SET category = $1 WHERE id=$2 AND user_id=$3 RETURNING *;';
    break;
  case 'active':
    queryString = 'UPDATE tasks SET active = $1 WHERE id=$2 AND user_id=$3 RETURNING *;';
    break;
  case 'description':
    queryString = 'UPDATE tasks SET description = $1 WHERE id=$2 AND user_id=$3 RETURNING *;';
    break;
  default:
  }
  return db.query(queryString, [newValue, taskid, userid])
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
};
exports.updateFieldOfTask = updateFieldOfTask;

/**
 * Delete given task for a corresponding user
 * @param {int} userid
 * @param {int} taskid
 * @return {Promise<{}>} A promise to the user.
 */
const deleteTask = function(userid, taskid) {
  const queryString = 'DELETE FROM tasks WHERE user_id=$1 AND id=$2 RETURNING *;';
  return db.query(queryString, [userid, taskid])
    .then(res => res.rows)
    .catch(err => console.error('query error', err.stack));
};
exports.deleteTask = deleteTask;
