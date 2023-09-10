const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authentication = require('../middleware/authentication');

router.post('/signup',authController.signup);
router.post('/signin',authController.signin);
router.get('/me',authController.me);

module.exports = router;
