const express = require("express");
const app = express();
const port = process.env.PORT || config.get("port");
const winston = require("winston");

require("./startup/logger")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const server = app.listen(port, () => {
  winston.info(`Examples app listening on port ${port}`);
});

module.exports = server;
