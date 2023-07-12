const router = require('express').Router();
const { default: axios } = require('axios');
const multer = require('multer');

router.get('/get-my-ip-info', (req, res) => {
  // let forwarded = req.headers['x-forwarded-for'];
  // let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  // res.status(200).json({ ip: ip });
  axios.get('https://api.ipify.org/?format=json').then(response => {
    const data = response?.data;
    axios.get(`http://ip-api.com/json/${data?.ip}`).then(regionData => {
      console.log('regionData: ', regionData);
      res.status(200).json(regionData.data);
    });
  });
});

module.exports = router;
