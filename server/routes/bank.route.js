const express = require("express");
const router = express.Router();

const controller = require("../controllers/bank.controller");
const checkIfAuthenticated = require("../../middlewares/checkIfAuthenticated");

router.get("/page/:limitItems", checkIfAuthenticated, controller.getPage);
router.delete("/delete/:id", checkIfAuthenticated, controller.deleteBank);
router.get("/get/page/:page/:limitItems", checkIfAuthenticated, controller.getBanks);
router.get("/get/:id", checkIfAuthenticated, controller.getOneBank);
router.post("/create", checkIfAuthenticated, controller.postBank);
router.post("/search", checkIfAuthenticated, controller.searchBank);
router.get("/question/search/:name", checkIfAuthenticated, controller.searchQuestion)
router.post("/get/questions", checkIfAuthenticated, controller.getQuestions);
router.get("/question/:id", checkIfAuthenticated, controller.getQuestion);
router.get(
  "/question/page/:id/:limitItems",
  checkIfAuthenticated,
  controller.getQuestionPages
);
router.post("/question", checkIfAuthenticated, controller.postQuestion);
router.put("/question", checkIfAuthenticated, controller.updateQuestion);
router.post("/update", checkIfAuthenticated, controller.updateBank);
module.exports = router;
