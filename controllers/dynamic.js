const express = require("express");
const {
  getAllDynamicData,
  getDynamicDataById,
  updateDynamicData,
  addDynamicData,
} = require("../services/dynamic");
const dynamicRouter = express.Router();

dynamicRouter.get("/", getAllDynamicData);

dynamicRouter.put("/:id", updateDynamicData);

dynamicRouter.get("/:id", getDynamicDataById);

dynamicRouter.post("/", addDynamicData);

module.exports = dynamicRouter;
