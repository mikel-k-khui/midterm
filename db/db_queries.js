/** single reference to the pg
*/
const db = require('./db_helper');

/**
 * Add a property to the database
 * @param {{}} list An object containing description of task, user created the file "created_by, and name of the list".
 * @return {Promise<{}>} A promise with a list:
 * user_id, list.name, last_modified, task.description, and status
 */
const getListId = function(user_list) {
  const userId = user_list[created_by];
  const list_name = user_list[name];

  const queryStr = `
  SELECT *
  FROM users_lists
  JOIN list ON list.id = users_lists.list_id
  WHERE users_lists.user_id = $1 AND list.name = $2;
  `;

  return db.idQuery(queryStr, [user_id, list_name);
};

/**
 * Add a property to the database
 * @param {{}} list An object containing description of task, user created the file "created_by, and name of the list".
 * @return {Promise<{}>} A promise with a list:
 * user_id, list.name, last_modified, task.description, and status
 */
const addTask = function(user_inputs) {
  let queryParams = [];

  //INSERT INTO task (list_id, last_modified, description)
// VALUES (1,'2019-03-12T08:06:00.000Z','Harry Potter theme park'),
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
