const winston = require("winston");
//require("winston-mongodb");

module.exports = function () {
  // process.on("uncaughtException", (ex) => {
  //   console.log("WE GOT UNCAUGHT EXCEPTION!");
  //   winston.error(ex.message, ex);
  //   process.exit(1);
  // });

  winston.exceptions.handle(
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  process.on("unhandledRejection", (ex) => {
    throw ex;
    // console.log("WE GOT UNCAUGHT REJECTION!");
    // winston.error(ex.message, ex);
    // process.exit(1);
  });

  winston.add(
    new winston.transports.File({
      filename: "logfile.log",
    })
  );

  winston.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );

  // winston.add(
  //   new winston.transports.MongoDB({
  //     db: "mongodb://localhost/vidly",
  //     level: "info",
  //   })
  // );
};
