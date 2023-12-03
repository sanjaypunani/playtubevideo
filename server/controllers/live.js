const commonFunction = require('../functions/commonFunctions');
const categoryModel = require('../models/categories');
const settingModel = require('../models/settings');
const livestream = require('../models/livestream');
const md5 = require('md5');
const globalModel = require('../models/globalModel');

exports.create = async (req, res) => {
  await commonFunction.getGeneralInfo(req, res, 'video_view');
  console.log('req.query: ', req.query.stream_id);

  const stream = await livestream.getLiveStreamById(req, req.query.stream_id);
  if (!stream[0]) {
    req.app.render(req, res, '/page-not-found', req.query);
  }
  req.query.stream = stream[0];
  //   req.query.videoId = req.params.id;
  //   req.query.lng = req.params.lng;

  //   let video = {};

  //   req.query.video = video;

  //   if (req.query.data) {
  //     res.send({ data: req.query });
  //     return;
  //   }
  if (req.query.data) {
    res.send({ data: req.query });
    return;
  }
  req.app.render(req, res, `/live/${req.params?.slug}`, req.query);
  return req.query;
};
