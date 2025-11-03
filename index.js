const express = require("express");
const app = express();
const cors = require("cors");
const config = require("config");
const port = process.env.PORT || config.get("port");
const winston = require("winston");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://rental-ebon.vercel.app",
];

const VERCEL_PREVIEW = /\.vercel\.app$/;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

      try {
        const host = new URL(origin).hostname;
        if (VERCEL_PREVIEW.test(host)) return cb(null, true);
      } catch (_) {
        // fall through
      }

      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
    exposedHeaders: ["x-auth-token"],
    credentials: false,
  })
);

app.get("/health", (_req, res) => res.send("ok"));

require("./startup/logger")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const server = app.listen(port, () => {
  winston.info(`Examples app listening on port ${port}`);
});

module.exports = server;
