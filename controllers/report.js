const express = require("express");
const {
  getRAGStatusReprotById,
  getGovernanceMeetingByDate,
  getEngineeringMatrices,
} = require("../services/reports");
const reportRouter = express.Router();
reportRouter.get("/rag-status/:id", getRAGStatusReprotById);
reportRouter.post("/governance-meetings", getGovernanceMeetingByDate);
reportRouter.post("/governance-meetings", getGovernanceMeetingByDate);
reportRouter.post("/engineering-matrices", getEngineeringMatrices);
module.exports = reportRouter;
