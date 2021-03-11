const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const checkIfAuthenticated = require("../../middlewares/checkIfAuthenticated");

router.post("/register", controller.postUser);
router.post("/login", controller.userLogin);
// router.post("/login", passport.authenticate('local',{successRedirect: '/', failureRedirect: '/login'}));

module.exports = router;
