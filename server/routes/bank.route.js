const express = require('express');
const router = express.Router();

const controller = require('../controllers/bank.controller');
const checkIfAuthenticated = require('../../middlewares/checkIfAuthenticated');

router.get('/get', checkIfAuthenticated, controller.getBank);
router.get('/get/:id', checkIfAuthenticated, controller.getOneBank);
router.post('/create', checkIfAuthenticated, controller.postBank);

module.exports = router;