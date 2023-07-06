const livestream = require('../../models/livestream');

exports.getLiveStreams = async (req, res) => {
  await livestream.getLiveStream(req).then(result => {
    return res.send({ streams: result });
  });
};

exports.createLiveStream = async (req, res) => {
  await livestream.createLiveStreamByApi(req, res).then(result => {
    return res.send({ streams: result });
  });
};

exports.updateLiveStream = async (req, res) => {
  await livestream.updateLivebyApi(req, res).then(result => {
    return res.send({ result });
  });
};

exports.deleteStreams = async (req, res) => {
  try {
    await livestream
      .deleteLiveStreamById(req, req.params.stream_id)
      .then(result => {
        return res.send({ streams: result });
      });
  } catch (error) {
    return res.send({ error });
  }
};

exports.getStreamById = async (req, res) => {
  try {
    await livestream
      .getLiveStreamById(req, req.params.stream_id)
      .then(result => {
        if (result[0]) {
          return res.send({ stream: result[0] });
        } else {
          return res.send({ stream: null });
        }
      });
  } catch (error) {
    return res.send({ error });
  }
};
