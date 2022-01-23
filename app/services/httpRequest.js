const axios = require("axios");
const instance = axios.create({
  baseURL: process.env.IMAGE4_BASE_URL,
  auth: {
    username: process.env.IMAGE4_USERNAME,
    password: process.env.IMAGE4_PASSWORD,
  },
});

module.exports = instance;
