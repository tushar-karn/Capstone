const express = require('express');
const { getSimulations, getSimulation, createSimulation, updateSimulation, deleteSimulation, joinSimulation, submitResults, getSimulationStats } = require('../controllers/simulationController');
const { authenticatedUser, staffOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticatedUser);

router.get('/stats/overview', staffOrAdmin, getSimulationStats);
router.get('/', getSimulations);
router.get('/:id', getSimulation);
router.post('/', staffOrAdmin, createSimulation);
router.put('/:id', staffOrAdmin, updateSimulation);
router.delete('/:id', staffOrAdmin, deleteSimulation);
router.post('/:id/join', joinSimulation);
router.post('/:id/results', submitResults);

module.exports = router;
