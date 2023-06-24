const router = require('express').Router();
const multer = require('multer');

router.get('/get-my-ip', (req, res) => {
  let forwarded = req.headers['x-forwarded-for'];
  console.log('forwarded: ', forwarded);
  let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  res.status(200).json({ ip: ip });
});

module.exports = router;
