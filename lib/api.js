// load .env data from process.env
const apiKey = process.env.API_KEY;
// require('./db');
const { apis, categories, tags } = require('./constant');
const pd = require('paralleldots');
pd.apiKey = apiKey;
// const axios = require('axios');

/**
 * Parse out JSON files and return it in more readable format for ouput
*/
const parseJSON = (requestBody) => JSON.parse(requestBody);

let query = '' || process.argv[2];

/**
 * Add a category to the task
 * @param {string} task
 * @return {objet} An API object with the relevant tagged category.
 */
const getTaxonomy = function(task) {
  if (task.length !== 0) {
    return pd.taxonomy(task)
      .then(response => {
        const res = parseJSON(response)['taxonomy'][0];
        (tags[res['tag']] !== undefined) ? res['category'] = tags[res['tag']] : res['category'] = categories[Math.floor(Math.random() * categories.length)];
        // console.log(res);
        return res;
      })
      .catch(e => {
        console.log("API error:", e);
        return e;
      });
  } else {
    return null;
  }
};
// getTaxonomy(query);

module.exports = { getTaxonomy };
