const express = require("express");
const router = express.Router();

const controller = require("../controllers/result.controller");
const checkIfAuthenticated = require("../../middlewares/checkIfAuthenticated");

router.get("/id/:id", checkIfAuthenticated, controller.getResultByIdResult);
router.get("/page", checkIfAuthenticated, controller.getPage);
router.get("/user/:page", checkIfAuthenticated, controller.getResultsByIdUser);
router.get("/test/:id/page/:page/:limitItem", checkIfAuthenticated, controller.getResultsByIdTest);
router.post("/test", checkIfAuthenticated, controller.getResultsByIdTestAndTime);
router.get("/test/:idTest/user/:idUser", checkIfAuthenticated, controller.getResultsByIdTestAndIdUser);
router.get("/user/name/:id", checkIfAuthenticated, controller.getUserName);
router.get("/analyze", checkIfAuthenticated, controller.getResultsAndAnalyze);
router.get("/analyze/score/:id/:time", checkIfAuthenticated, controller.analyzeWithScore);
router.get("/analyze/score/pie/:id/:time", checkIfAuthenticated, controller.analyzeScoreWithPieChart);
router.get("/analyze/score/line/:id/:time", checkIfAuthenticated, controller.analyzeTimeWithLineChart);
router.get("/analyze/bank/:id", checkIfAuthenticated, controller.analyzeWithBankId)
module.exports = router;
