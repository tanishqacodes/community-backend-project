const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.post('/',memberController.addMember);
router.delete('/:id',memberController.deleteMember);

module.exports = router;