const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, acknowledgeNotification } = require('../controllers/notificationController');
const { authenticatedUser, staffOrAdmin } = require('../middleware/auth');

router.use(authenticatedUser);

router.route('/')
  .get(getNotifications)
  .post(staffOrAdmin, createNotification);

router.route('/:id/acknowledge')
  .put(acknowledgeNotification);

module.exports = router;
