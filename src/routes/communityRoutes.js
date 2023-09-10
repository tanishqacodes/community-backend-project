const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.post('/',communityController.create);
router.get('/',communityController.getAllCommunity);

module.exports = router;