const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.post('/',roleController.create);
router.get('/',roleController.getAllRole);

module.exports = router;