const mysql = require("mysql");
const config = require("./config");
const pool = mysql.createPool({
  connectionLimit: 100,
  ...config.dbConnectionString.connection
});
module.exports.dbConnectionProvider = pool;