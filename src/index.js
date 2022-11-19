'use strict';
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const routerConfig = require('./modules/route');
const config = require('./config/config');
const { logger } = require('./helpers/logger');
const { resetMenu, getMenu } = require('./modules/menu/menu');
const { signup, login } = require('./modules/auth/auth');
const { placeOrder } = require('./modules/order/order');

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


const configureApiEndpoints = (app) => {
  app.use("/api/v1/", routerConfig.init());
  // routerConfig.init(app);
  // define a route handler for the default home page
  app.get( "/", (req, res) => {
    res.send( "Welcome to Food Ordering System's Backend" );
  });
  app.post("/place-order", async (req, res) => {
    let data = req.body;
    // console.log(data);
    const ret = placeOrder(data);
    res.send(ret);
  });
  app.get("/get-menu", async (req, res) => {
    let data = await getMenu();
    // res.send(JSON.stringify(data));
    res.send(data)
  })

  app.post("/signup", async (req, res) => {
    let data = req.body;
    let ret = await signup(data);
    res.send({
      status: ret.status,
      uid: ret.uid,
      name: ret.name,
    }); 
  });

  app.post("/login", async (req, res) => {
    let data = req.body;
    let ret = await login(data);
    res.send({
      status: ret.status,
      uid: ret.uid,
      name: ret.name,
    });
  })

  app.get("/reset-menu", async (req, res) => {
    const ret = await resetMenu();
    res.send(ret);
  })
};

init();
