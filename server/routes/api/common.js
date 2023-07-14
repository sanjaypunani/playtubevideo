const router = require('express').Router();
const { default: axios } = require('axios');
const multer = require('multer');

router.get('/get-my-ip-info/:ip', (req, res) => {
  console.log('ip: ', req.params.ip);

  const ip = req.params.ip;

  axios.get(`http://ip-api.com/json/${ip}`).then(regionData => {
    console.log('regionData: ', regionData);
    res.status(200).json(regionData.data);
  });
  // let forwarded = req.headers['x-forwarded-for'];
  // let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  // res.status(200).json({ ip: ip });
});

module.exports = router;
