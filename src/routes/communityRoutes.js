const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.post('/',communityController.create);
router.get('/',communityController.getAllCommunity);
router.get('/me/owner',communityController.myOwnedCommunity);
router.get('/:id/members',communityController.getAllCommunityMembers);
// router.get('/me/member',communityController.myOwnedCommunity);

module.exports = router;