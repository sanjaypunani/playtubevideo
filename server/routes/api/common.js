const router = require('express').Router();
const { default: axios } = require('axios');
const multer = require('multer');
const controller = require('../../controllers/api/category');

router.get('/get-my-ip-info/:ip', (req, res) => {
  const ip = req.params.ip;
  axios.get(`http://ip-api.com/json/${ip}`).then(regionData => {
    res.status(200).json(regionData.data);
  });
  // let forwarded = req.headers['x-forwarded-for'];
  // let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  // res.status(200).json({ ip: ip });
});

router.post('/category/create', multer().none(), controller.createCategory);
router.get(
  '/category-by-slug/:slug',
  multer().none(),
  controller.getCategoryBySlug,
);

module.exports = router;
