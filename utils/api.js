const axios = require("axios");

async function api({ method, url, data }) {
  axios.defaults.baseURL = process.env.API_URL;
  axios.defaults.headers.common.Plaftorm = "WEB";

  const result = await axios({
    method,
    url,
    data,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => response.data)
    .catch((error) => console.error(`API ${url} error: ${error}`));

  return result;
}

module.exports = api;
