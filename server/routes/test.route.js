const express = require('express');
const router = express.Router();

const controller = require('../controllers/test.controller');
const checkIfAuthenticated = require('../../middlewares/checkIfAuthenticated');

router.get('/', checkIfAuthenticated, controller.allTest);
router.post('/create', checkIfAuthenticated, controller.createTest);
router.get('/access/:shortId', checkIfAuthenticated, controller.accessTest);
// router.get('/detail/:id', checkIfAuthenticated, controller.detailTest);

module.exports = router;