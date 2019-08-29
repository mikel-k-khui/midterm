const axios = require('axios');
const { apis, descs } = require('./constant');
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI(apis["wolfram"]["params"]["appid"]);
const pd = require('paralleldots');
pd.apiKey = apis["paralleldots"]["apiKey"];
/**
 * Parse out JSON files and return it in more readable format for ouput
*/
const parseJSON = (requestBody) => JSON.parse(requestBody);
// let promises =[];
// let values = [];
// let query = '' || process.argv[2];

// const getTaxonomies = function(tasks) {
//   pd.taxonomyBatch(JSON.stringify(tasks))
//     .then((res) => {
//       const response = parseJSON(res)["taxonomy"];
//       for (const res in response) {
//         console.log(descs[res], ",", response[res][0]["tag"], ",", response[res][1]["tag"], ",", response[res][2]["tag"]);
//       }
//     }).catch((e) => e)
// };
// getTaxonomies(descs);

const getTaxonomy = function(task) {
  return pd.taxonomy(task)
    .then(res => {
      const response = parseJSON(res)["taxonomy"];
      console.log(response);
      return response;
    })
    .catch(e => console.log(e));
};
// getTaxonomy(query);

// const getDatatypes = function() {

//   for (const desc of descs) {
//     promises.push(waApi.getFull(desc).then(res => res.datatypes));
//   }

//   Promise.all(promises)
//     .then(values => console.log(values));
// };
// getDatatypes();

// waApi.getSimple(apis["wolfram"]["config"]["params"]["input"]).then(res => console.log("Simple", res)).catch(console.error);

module.exports = { getTaxonomy , };

// /*
// $ curl 'https://api.ipify.org?format=json'
// {"ip":"184.68.214.222"}
// source: https://www.ipify.org/
// */
