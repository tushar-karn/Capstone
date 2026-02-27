const express = require('express');
const { getIncidents, getIncident, createIncident, updateIncident, deleteIncident, getIncidentStats } = require('../controllers/incidentController');
const { authenticatedUser, staffOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticatedUser);

router.get('/stats/overview', staffOrAdmin, getIncidentStats);
router.get('/', getIncidents);
router.get('/:id', getIncident);
router.post('/', createIncident);
router.put('/:id', staffOrAdmin, updateIncident);
router.delete('/:id', staffOrAdmin, deleteIncident);

module.exports = router;
