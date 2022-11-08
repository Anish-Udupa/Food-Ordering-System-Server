const mariadb = require("mariadb");
const config = require("../config/config");

const pool = mariadb.createPool({
    // host: "localhost",
    // port: 3306,
    // user: "webserver",
    // password: "pass123",
    // database: "food_ordering_app",
    // connectionLimit: 5,
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    connectionLimit: 5,
});

module.exports = Object.freeze({
    pool: pool
});