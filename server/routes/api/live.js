const router = require('express').Router();
const multer = require('multer');
const controller = require('../../controllers/api/live');
const resize = require('../../functions/resize');
const path = require('path');
const upload = require('../../functions/upload').upload;
const fs = require('fs');

router.get('/lives', multer().none(), controller.getLiveStreams);
router.post(
  '/lives',
  (req, res, next) => {
    req.allowedFileTypes = /jpeg|jpg|png|gif/;
    var currUpload = upload('image', 'upload/images/lives/posters/', req);
    req.imageResize = [{ width: req.widthResize, height: req.heightResize }];
    currUpload(req, res, function (err) {
      if (err) {
        req.imageError =
          'Uploaded image is too large to upload, please choose smaller image and try again.';
        next();
      } else {
        req.fileName = req.file ? req.file.filename : false;
        if (
          req.file &&
          req.appSettings.upload_system != 's3' &&
          req.appSettings.upload_system != 'wisabi'
        ) {
          const extension = path.extname(req.fileName);
          const file = path.basename(req.fileName, extension);
          const pathName =
            req.serverDirectoryPath + '/public/upload/images/lives/posters/';
          const newFileName = file + '_main' + extension;
          console.log('pathName', pathName);
          var resizeObj = new resize(pathName, req.fileName, req);
          resizeObj
            .save(newFileName, {
              width: req.widthResize,
              height: req.heightResize,
            })
            .then(res => {
              if (res) {
                fs.unlink(pathName + req.fileName, function (err) {
                  if (err) {
                    console.error(err);
                  }
                });
                req.fileName = newFileName;
                next();
              } else {
                req.imageError =
                  'Your image contains an unknown image file encoding. The file encoding type is not recognized, please use a different image.';
                next();
              }
            });
        } else {
          next();
        }
      }
    });
  },
  controller.createLiveStream,
);
router.put('/lives/:stream_id', multer().none(), controller.updateLiveStream);

router.delete('/lives/:stream_id', multer().none(), controller.deleteStreams);
router.get('/lives/:stream_id', multer().none(), controller.getStreamById);

module.exports = router;
