/** single reference to the pg
*/
const db = require('./db_helper');

/**
 * Add a property to the database
 * @param {{}} list An object containing description of task, user created the file "created_by, and name of the list".
 * @return {Promise<{}>} A promise with a list:
 * user_id, list.name, last_modified, task.description, and status
 */
const getTaskId = function(task) {
  const queryStr = `
  SELECT *
  FROM tasks
  WHERE description = $1;
  `;

  return db.idQuery(queryStr, [task]);
};

/**
 * Add a property to the database
 * @param {{}} list An object containing description of task, user created the file "created_by, and name of the list".
 * @return {Promise<{}>} A promise with a list:
 * user_id, list.name, last_modified, task.description, and status
 */
const addTask = function(user_inputs) {
  let queryParams = [];

  //INSERT INTO task (user_id, last_modified, description, category)
// VALUES (1,'2019-03-12T08:06:00.000Z','Harry Potter theme park', 'To eat'),
  let insertStr = 'INSERT INTO task (';
  let valuesStr = 'VALUES (';

  for (const param in property) {
    insertStr += `${param}, `;
    // console.log(`${param}=${property[param]}`);
    queryParams.push(`${property[param]}`);
    valuesStr += `$${queryParams.length}, `;
  }

  if (insertStr.endsWith(', ')) {
    insertStr = insertStr.substring(0, insertStr.length - 2) + `)
    `;
  }
  if (valuesStr.endsWith(', ')) {
    valuesStr = valuesStr.substring(0, valuesStr.length - 2) + ') RETURNING *;';
  }

  // console.log(insertStr + valuesStr);
  return db.query(insertStr + valuesStr, queryParams);
};
