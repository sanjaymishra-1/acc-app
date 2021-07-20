const express = require("express");
const {
  addData,
  updateData,
  getData,
  deleteData,
  executeSearch,
  getAllData,
} = require("../services/records");
const recordsRouter = express.Router();

recordsRouter.post("/addData", addData);
recordsRouter.put("/updateData/:id", updateData);

recordsRouter.get("/getData/:id", getData);

recordsRouter.delete("/deleteData/:id", deleteData);

recordsRouter.post("/search", executeSearch);

recordsRouter.get("/getExcel", getAllData);

module.exports = recordsRouter;
