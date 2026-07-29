const express = require("express");
const mongoose = require("mongoose");
const config = require("./utils/config");
const morgan = require("morgan");
const middleware = require("./utils/middleware");
const notesRouter = require("./controllers/notes");

const app = express();

const dns = require("dns");
dns.setServers(["1.1.1.1", "0.0.0.0"]);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.use(express.static("dist"));
app.use(express.json());
morgan.token("body", (req, res) => res.body);
app.use(morgan("dev"));

app.use("/api/notes", notesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
