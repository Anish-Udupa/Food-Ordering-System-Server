'use strict';
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const routerConfig = require('./modules/route');
const config = require('./config/config');
const { logger } = require('./helpers/logger');
const db = require('./db/db');

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
  app.use(cors({
    origin: "*",
  }));
  return;
};

const getAllValues = async () => {
  let conn;
  try {
    conn = await db.pool.getConnection();
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

const signup = async (data) => {
  let status = false;
  let conn;
  try{
    conn = await db.pool.getConnection();
    const rec_count = Number((await conn.query("SELECT count(*) AS count from user;"))[0].count);
    // TODO: Check if same email is registered. If yes, reject signup attempt
    // console.log(rec_count);
    await conn.query(`INSERT INTO user (Uid, Fname, LName, HouseNo, Street, Area, City, Email, Phone) VALUES (${rec_count+1}, "${data.fname}", "${data.lname}", "${data.house_no}", "${data.street}", "${data.area}", "${data.city}", "${data.email}", ${data.phone})`);
    await conn.query(`INSERT INTO user_login VALUES (${rec_count+1}, "${data.email}", "${data.password}")`);
    status = true;
  }
  catch(err){
    console.log(err);
  }
  finally {
    if(conn) conn.end();
  }
  return status;
}

const login = async (data) => {
  let conn;
  let status = false, name = null;
  try {
    conn = await db.pool.getConnection();
    const q_data = (await conn.query(`SELECT Uid as uid, Password as password FROM user_login WHERE Email="${data.email}";`))[0];
    console.log(q_data);
    if(q_data != undefined && q_data.password === data.password){
      const uname = (await conn.query(`SELECT FName as name from user WHERE Uid="${q_data.uid}";`))[0];
      if(uname != undefined){
        status = true;
        name = uname.name;
      }
    }
  }
  catch(err){
    console.log(err);
  }
  finally {
    if(conn) conn.close();
  }
  return {
    status: status,
    name: name,
  };
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

  app.post("/signup", async (req, res) => {
    let data = req.body;
    let ret = await signup(data);
    res.send(JSON.stringify({
      status: ret,
    })); 
  });

  app.post("/login", async (req, res) => {
    let data = req.body;
    let ret = await login(data);
    res.send({
      status: ret.status,
      name: ret.name,
    });
  })
};

init();
