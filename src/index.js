'use strict';
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const routerConfig = require('./modules/route');
const config = require('./config/config');
const { logger } = require('./helpers/logger');

const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5,
});

const init = () => {
  // *** express instance *** //
  const app = express();
  // Configuraing the standard middlewares.
  setupStandardMiddlewares(app);
  configureApiEndpoints(app);
  app.listen(config.SERVER_PORT);
  console.log(`Listening on port ${config.SERVER_PORT} in ${config.NODE_ENV} mode`);
  logger.info(`Listening on port ${config.SERVER_PORT} in ${config.NODE_ENV} mode`)
};

const setupStandardMiddlewares = (app) => {
  // parse requests of content-type - application/json
  app.use(bodyParser.json());
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());
  return;
};

const getAllValues = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const data = await conn.query("Select * from Menu;");
    console.log(data);
    conn.end();
    return data;
  }
  catch(err) {
    console.log(err);
  }
  finally {
    if(conn) conn.end();
  }
}

const configureApiEndpoints = (app) => {
  app.use("/api/v1/", routerConfig.init());
  // routerConfig.init(app);
  // define a route handler for the default home page
  app.get( "/", (req, res) => {
    res.send( "Welcome to express-create application! " );
  });
  app.post("/place-order", (req, res) => {
    let body = req.body;
    console.log(body);
    res.send("Success")
  });
  app.get("/all-items", async (req, res) => {
    let data = await getAllValues();
    // res.send(JSON.stringify(data));
    res.send(data)
  })
  app.post("/signup", (req, res) => {
    let data = req.body;
    console.log(data);
    res.send("Success! It works!");
  })
};

init();
