const express = require('express');
const { getLessons, getLesson, createLesson, updateLesson, deleteLesson, getLessonStats, completeLesson } = require('../controllers/lessonController');
const { authenticatedUser, staffOrAdmin, officerOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticatedUser);

router.get('/stats/overview', staffOrAdmin, getLessonStats);
router.get('/', getLessons);
router.get('/:id', getLesson);
router.post('/', officerOrAdmin, createLesson);
router.post('/:id/complete', completeLesson);
router.put('/:id', officerOrAdmin, updateLesson);
router.delete('/:id', officerOrAdmin, deleteLesson);

module.exports = router;
