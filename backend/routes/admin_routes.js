const express = require('express');
const router = express.Router();
const admin_controllers = require('../controllers/admin_controllers');
const faq_controllers = require('../controllers/faq_controllers');
const { verifyToken } = require('../middleware/auth');

//admin routes
router.post('/login', admin_controllers.login);

//faq routes
router.get('/faq', verifyToken, faq_controllers.getAllFaq);
router.post('/faq', verifyToken, faq_controllers.createFaq);
router.patch('/faq/:id', verifyToken, faq_controllers.updateFaq);
router.delete('/faq/:id', verifyToken, faq_controllers.deleteFaq);

module.exports = router;