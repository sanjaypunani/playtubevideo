const livestream = require('../../models/livestream');

exports.getLiveStreams = async (req, res) => {
  await livestream.getLiveStream(req).then(result => {
    return res.send({ streams: result });
  });
};

exports.deleteStreams = async (req, res) => {
  try {
    console.log('get responce', req.params.stream_id);
    await livestream
      .deleteLiveStreamById(req, req.params.stream_id)
      .then(result => {
        return res.send({ streams: result });
      });
  } catch (error) {
    return res.send({ error });
  }
};
