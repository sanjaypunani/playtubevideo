const fieldErrors = require('../../functions/error');
const errorCodes = require('../../functions/statusCodes');
const constant = require('../../functions/constant');
const globalModel = require('../../models/globalModel');
const ffmpeg = require('fluent-ffmpeg');
const dateTime = require('node-datetime');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');
const crypto = require('crypto');

/**
 * Receive a single chunk of a large video upload.
 * Chunks are stored in a temp directory: upload/videos/chunks/{uploadId}/
 *
 * Expects multipart form data with:
 *   - upload: the chunk file
 *   - chunkIndex: 0-based index of this chunk
 *   - totalChunks: total number of chunks
 *   - uploadId: (optional on first chunk) unique upload session ID
 *   - fileName: original file name
 */
exports.uploadChunk = async (req, res) => {
  try {
    if (req.imageError) {
      return res
        .send({
          error: fieldErrors.errors([{ msg: req.imageError }], true),
          status: errorCodes.invalid,
        })
        .end();
    }
    if (req.uploadLimitError) {
      return res
        .send({
          error: fieldErrors.errors(
            [{ msg: constant.video.LIMITERRROR }],
            true,
          ),
          status: errorCodes.invalid,
        })
        .end();
    }
    if (req.quotaLimitError) {
      return res
        .send({
          error: fieldErrors.errors(
            [{ msg: constant.video.QUOTAREACHED }],
            true,
          ),
          status: errorCodes.invalid,
        })
        .end();
    }

    const chunkIndex = parseInt(req.body.chunkIndex);
    const totalChunks = parseInt(req.body.totalChunks);
    const fileName = req.body.fileName;

    if (isNaN(chunkIndex) || isNaN(totalChunks) || !fileName) {
      return res
        .send({
          error: fieldErrors.errors(
            [{ msg: 'Missing required chunk upload parameters.' }],
            true,
          ),
          status: errorCodes.invalid,
        })
        .end();
    }

    // Generate or use existing uploadId
    let uploadId = req.body.uploadId;
    if (!uploadId || chunkIndex === 0) {
      uploadId =
        Date.now() +
        '_' +
        crypto.randomBytes(8).toString('hex') +
        '_' +
        req.user.user_id;
    }

    const basePath = req.serverDirectoryPath + '/public';
    const chunksDir = basePath + '/upload/videos/chunks/' + uploadId;

    // Create chunks directory if it doesn't exist
    if (!fs.existsSync(basePath + '/upload/videos/chunks/')) {
      fs.mkdirSync(basePath + '/upload/videos/chunks/', { recursive: true });
    }
    if (!fs.existsSync(chunksDir)) {
      fs.mkdirSync(chunksDir, { recursive: true });
    }

    // The chunk file was saved by multer to upload/videos/video/
    // Move it to the chunks directory
    if (!req.file) {
      return res
        .send({
          error: fieldErrors.errors(
            [{ msg: 'No chunk file received.' }],
            true,
          ),
          status: errorCodes.invalid,
        })
        .end();
    }

    const chunkSource =
      basePath + '/upload/videos/video/' + req.file.filename;
    const chunkDest = chunksDir + '/chunk_' + chunkIndex;

    // Move chunk from multer's destination to our chunks directory
    fs.renameSync(chunkSource, chunkDest);

    return res.send({
      uploadId: uploadId,
      chunkIndex: chunkIndex,
      received: true,
    });
  } catch (err) {
    console.error('Chunk upload error:', err);
    return res
      .send({
        error: fieldErrors.errors(
          [{ msg: 'Something went wrong during chunk upload.' }],
          true,
        ),
        status: errorCodes.serverError,
      })
      .end();
  }
};

/**
 * Complete a chunked upload by assembling all chunks into a single file.
 * Then processes it exactly like the normal upload handler (ffprobe, screenshot, DB insert).
 *
 * Expects form data with:
 *   - uploadId: the upload session ID
 *   - totalChunks: total number of chunks
 *   - fileName: original file name
 */
exports.uploadChunkComplete = async (req, res) => {
  try {
    const uploadId = req.body.uploadId;
    const totalChunks = parseInt(req.body.totalChunks);
    const originalFileName = req.body.fileName;

    if (!uploadId || isNaN(totalChunks) || !originalFileName) {
      return res
        .send({
          error: fieldErrors.errors(
            [{ msg: 'Missing required parameters for chunk assembly.' }],
            true,
          ),
          status: errorCodes.invalid,
        })
        .end();
    }

    if (req.uploadLimitError) {
      return res
        .send({
          error: fieldErrors.errors(
            [{ msg: constant.video.LIMITERRROR }],
            true,
          ),
          status: errorCodes.invalid,
        })
        .end();
    }
    if (req.quotaLimitError) {
      return res
        .send({
          error: fieldErrors.errors(
            [{ msg: constant.video.QUOTAREACHED }],
            true,
          ),
          status: errorCodes.invalid,
        })
        .end();
    }

    const basePath = req.serverDirectoryPath + '/public';
    const chunksDir = basePath + '/upload/videos/chunks/' + uploadId;

    // Verify all chunks exist
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = chunksDir + '/chunk_' + i;
      if (!fs.existsSync(chunkPath)) {
        return res
          .send({
            error: fieldErrors.errors(
              [{ msg: 'Missing chunk ' + i + '. Please re-upload.' }],
              true,
            ),
            status: errorCodes.invalid,
          })
          .end();
      }
    }

    // Create final file name
    const extension = path.extname(originalFileName);
    const finalFileName =
      Date.now() +
      '_' +
      Math.random().toString(36).substring(12) +
      '_' +
      extension;
    const finalFilePath =
      basePath + '/upload/videos/video/' + finalFileName;

    // Assemble chunks into the final file
    const writeStream = fs.createWriteStream(finalFilePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = chunksDir + '/chunk_' + i;
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
    }

    // Wait for write stream to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      writeStream.end();
    });

    // Clean up chunk files and directory
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = chunksDir + '/chunk_' + i;
      try {
        fs.unlinkSync(chunkPath);
      } catch (e) {
        // ignore cleanup errors
      }
    }
    try {
      fs.rmdirSync(chunksDir);
    } catch (e) {
      // ignore cleanup errors
    }

    // Now process the assembled video exactly like the normal upload handler
    const filePath = finalFilePath;
    let images = [];
    let duration = 0;
    let videoWidth = 0;
    let videoHeight = 0;
    let size = 0;

    var command = ffmpeg.ffprobe(filePath, function (err, metadata) {
      if (err || !metadata || !metadata.format) {
        // Clean up the file on error
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
        return res
          .send({
            error: fieldErrors.errors(
              [
                {
                  msg: 'Unable to process video file. Please ensure it is a valid video format.',
                },
              ],
              true,
            ),
            status: errorCodes.invalid,
          })
          .end();
      }

      duration = metadata.format.duration.toString();
      videoWidth = metadata.streams[0].width;
      videoHeight = metadata.streams[0].height;
      size = metadata.format.size;

      ffmpeg(filePath)
        .on('filenames', function (filenames) {
          images = filenames;
        })
        .on('end', function () {
          // Append base path to images
          let uploadedImages = [];
          images.forEach(image => {
            uploadedImages.push(
              req.APP_HOST + '/upload/images/videos/video/' + image,
            );
          });

          // Create video record in database
          let videoObject = {};
          videoObject['owner_id'] = req.user.user_id;
          videoObject['completed'] = 0;
          videoObject['image'] =
            '/upload/images/videos/video/' + images[0];
          videoObject['video_location'] =
            '/upload/videos/video/' + finalFileName;
          videoObject['type'] = 3;
          videoObject['title'] = 'Untitled';
          videoObject['view_privacy'] = 'everyone';
          videoObject['custom_url'] = '';
          videoObject['description'] = '';
          var dt = dateTime.create();
          var formatted = dt.format('Y-m-d H:M:S');
          videoObject['creation_date'] = formatted;
          videoObject['modified_date'] = formatted;
          videoObject['status'] = 2;
          videoObject['size'] = size;

          var n = duration.indexOf('.');
          duration = duration.substring(
            0,
            n != -1 ? n : duration.length,
          );
          let d = Number(duration);
          var h = Math.floor(d / 3600).toString();
          var m = Math.floor((d % 3600) / 60).toString();
          var s = Math.floor((d % 3600) % 60).toString();

          var hDisplay =
            h.length > 0 ? (h.length < 2 ? '0' + h : h) : '00';
          var mDisplay =
            m.length > 0
              ? ':' + (m.length < 2 ? '0' + m : m)
              : ':00';
          var sDisplay =
            s.length > 0
              ? ':' + (s.length < 2 ? '0' + s : s)
              : ':00';
          const time = hDisplay + mDisplay + sDisplay;
          videoObject['duration'] = time;

          globalModel
            .create(req, videoObject, 'videos')
            .then(result => {
              res.send({
                videoWidth: videoWidth,
                videoHeight: videoHeight,
                videoId: result.insertId,
                images: uploadedImages,
                name: path.basename(
                  originalFileName,
                  path.extname(originalFileName),
                ),
              });
            });
        })
        .on('error', function (err) {
          console.error('FFmpeg screenshot error:', err);
          return res
            .send({
              error: fieldErrors.errors(
                [{ msg: 'Error processing video file.' }],
                true,
              ),
              status: errorCodes.serverError,
            })
            .end();
        })
        .screenshots({
          count: 1,
          folder: basePath + '/upload/images/videos/video/',
          filename: '%w_%h_%b_%i',
        });
    });

    // Kill ffmpeg after 5 minutes anyway
    setTimeout(function () {
      if (typeof command != 'undefined') {
        command.on('error', function () {
          return res
            .send({
              error: fieldErrors.errors(
                [{ msg: constant.general.GENERAL }],
                true,
              ),
              status: errorCodes.serverError,
            })
            .end();
        });
        command.kill();
      }
    }, 60 * 5 * 1000);
  } catch (err) {
    console.error('Chunk complete error:', err);
    return res
      .send({
        error: fieldErrors.errors(
          [{ msg: 'Something went wrong during video assembly.' }],
          true,
        ),
        status: errorCodes.serverError,
      })
      .end();
  }
};
