const router = require('express').Router();
const multer = require('multer');
const controller = require('../../controllers/api/live');

router.get('/lives', multer().none(), controller.getLiveStreams);
router.delete('/lives/:stream_id', multer().none(), controller.deleteStreams);

module.exports = router;
