const express = require('express');
const router = express.Router();
const admin_controllers = require('../controllers/admin_controllers');

router.post('/login', admin_controllers.login);

module.exports = router;