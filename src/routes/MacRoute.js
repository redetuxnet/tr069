const express = require('express');
const router = express.Router();
const controller = require('../controllers/macController')
router.get('/:mac', controller.getMaclan);
router.get('/macwan/:mac', controller.getMacwan);
module.exports = router;