const express = require("express");
const mongoose = require("mongoose");
const dynamicRouter = require("./controllers/dynamic");
const url = "mongodb://localhost/accDB";
const bodyParser = require("body-parser");
const cors = require("cors");
const recordsRouter = require("./controllers/records");
const reportRouter = require("./controllers/report");
const app = express();
app.use(express.json());
app.use(cors());

/**For online db  */
const uri =
  "mongodb+srv://sanjay:VBRSaDQQbARHAuXM@exam-projects.of5bb.mongodb.net/accDB?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set("debug", (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});

const con = mongoose.connection;

con.on("open", function name() {
  console.log("connected");
});

//for route error handling

app.listen(process.env.PORT | 9000, "0.0.0.0", function name() {
  console.log("server started");
});

app.use("/dynamic-fields", dynamicRouter);
app.use("/report", reportRouter);
app.use("/", recordsRouter);

app.use((req, res, next) => {
  res.status(404).send({
    status: 0,
    message: "Not found",
    data: [],
  });
});
//for unhandled exceptions
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send("Something Broke!");
});
