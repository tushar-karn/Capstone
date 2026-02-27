const express = require('express');
const { getUsers, getUser, updateUser, deleteUser, getUserStats } = require('../controllers/userController');
const { authenticatedUser, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authenticatedUser);

router.get('/stats/overview', adminOnly, getUserStats);
router.get('/', adminOnly, getUsers);
router.get('/:id', adminOnly, getUser);
router.put('/:id', adminOnly, updateUser);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
