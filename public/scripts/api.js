// load .env data into process.env
require('dotenv').config();
const { apiKey } = require('../../lib/db.js');
const { apis, categories, tags } = require('./constant');
const pd = require('paralleldots');
pd.apiKey = apiKey;
// const axios = require('axios');

/**
 * Parse out JSON files and return it in more readable format for ouput
*/
const parseJSON = (requestBody) => JSON.parse(requestBody);

let query = '' || process.argv[2];

const getTaxonomy = function(task) {
  if (task.length !== 0) {
  return pd.taxonomy(task)
    .then(response => {
      const res = parseJSON(response)['taxonomy'][0];
      (tags[res['tag']] !== undefined) ? res['category'] = tags[res['tag']] : res['category'] = categories[Math.floor(Math.random() * categories.length)];
      console.log(res);
      return res;
    })
    .catch(e => console.log(e));
  } else {
    return null;
  }
};
getTaxonomy(query);

module.exports = { getTaxonomy , };

// /*
// $ curl 'https://api.ipify.org?format=json'
// {'ip':'184.68.214.222'}
// source: https://www.ipify.org/
// */
// const getTaxonomies = function(tasks) {
//   pd.taxonomyBatch(JSON.stringify(tasks))
//     .then((res) => {
//       const response = parseJSON(res)['taxonomy'];
//       for (const res in response) {
//         console.log(descs[res], ',', response[res][0]['tag'], ',', response[res][1]['tag'], ',', response[res][2]['tag']);
//       }
//     }).catch((e) => e)
// };
// getTaxonomies(descs);
