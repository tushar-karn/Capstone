const express = require('express');
const { getDashboardData, getIncidentAnalytics, getSimulationAnalytics, getParticipationStats } = require('../controllers/reportController');
const { authenticatedUser, staffOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticatedUser);

router.get('/dashboard', getDashboardData);
router.get('/incidents', staffOrAdmin, getIncidentAnalytics);
router.get('/simulations', staffOrAdmin, getSimulationAnalytics);
router.get('/participation', staffOrAdmin, getParticipationStats);

module.exports = router;
