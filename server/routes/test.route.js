const express = require('express');
const router = express.Router();

const controller = require('../controllers/test.controller');
const checkIfAuthenticated = require('../../middlewares/checkIfAuthenticated');

router.post('/', checkIfAuthenticated, controller.allTest);
router.get('/page/:idBank', checkIfAuthenticated, controller.getPage);
router.get('/detail/:idTest', checkIfAuthenticated, controller.detailTest);
router.post('/create', checkIfAuthenticated, controller.createTest);
router.get('/access/:shortId', checkIfAuthenticated, controller.accessTest);
router.post('/submit', checkIfAuthenticated, controller.submitTest);
router.post('/check/code', checkIfAuthenticated, controller.checkCode);
router.post('/question', checkIfAuthenticated, controller.getOneQuestionInTest);

module.exports = router;