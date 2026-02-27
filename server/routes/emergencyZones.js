const express = require('express');
const { getZones, getZone, createZone, updateZone, deleteZone, getWarnings } = require('../controllers/emergencyZoneController');
const { authenticatedUser, staffOrAdmin, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authenticatedUser);

router.get('/ai/warnings', getWarnings);
router.get('/', getZones);
router.get('/:id', getZone);
router.post('/', adminOnly, createZone);
router.put('/:id', adminOnly, updateZone);
router.delete('/:id', adminOnly, deleteZone);

module.exports = router;
