const dateTime = require('node-datetime');

module.exports = {
  createLiveStream: function (connection, data) {
    return new Promise(function (resolve, reject) {
      let insertData = [];
      insertData.push(data.stream_id);
      insertData.push(data.user_id);
      insertData.push(data.stream_url);
      insertData.push(data.poster);
      insertData.push(dateTime.create().format('Y-m-d H:M:S'));
      let sql =
        'INSERT INTO `live_stream`( `stream_id`, `user_id`, `stream_url`, `poster`,`creation_date`) VALUES (?,?,?,?,?)';
      connection.query(sql, insertData, function (err, results) {
        if (!err) {
          console.log('success true');
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  },

  deleteLiveStream: function (connection, data) {
    return new Promise(function (resolve, reject) {
      let queryValue = data.stream_id;
      let query = 'DELETE FROM live_stream WHERE stream_id = ?';
      if (!queryValue) {
        queryValue = data?.stream_url;
        query = 'DELETE FROM live_stream WHERE stream_url = ?';
      }

      connection.query(query, [queryValue], function (err, results) {
        if (!err) {
          console.log('success true');
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  },

  updateLiveStreamStatus: function (connection, data) {
    return new Promise(function (resolve, reject) {
      let queryValue = data.stream_id;
      const objectData = {
        status: data?.status,
      };
      const updateColumns = Object.keys(objectData)
        .map(column => `${column} = '${objectData[column]}'`)
        .join(', ');
      let updateQuery = `UPDATE ${'live_stream'} SET ${updateColumns} WHERE stream_id = '${
        data?.stream_id
      }'`;

      if (!queryValue) {
        queryValue = data?.stream_url;
        updateQuery = `UPDATE ${'live_stream'} SET ${updateColumns} WHERE stream_url = '${
          data?.stream_url
        }'`;
      }

      connection.query(updateQuery, function (err, results) {
        if (!err) {
          console.log('Update stream success');
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  },

  getLiveStream: function (req) {
    return new Promise(function (resolve, reject) {
      req.getConnection(function (err, connection) {
        const status = req?.query?.status;
        let query = 'SELECT * FROM live_stream';
        if (status) {
          query = query + ` WHERE status = '${status}'`;
        }
        connection.query(query, function (err, results) {
          if (err) {
            resolve(false);
          }
          resolve(results);
        });
      });
    });
  },

  deleteLiveStreamById: function (res, id) {
    return new Promise(function (resolve, reject) {
      res.getConnection(function (err, connection) {
        connection.query(
          'DELETE FROM live_stream WHERE stream_id = ?',
          [id],
          function (err, results) {
            if (err) {
              resolve(err);
            }
            resolve(results);
          },
        );
      });
    });
  },

  getLiveStreamById: function (res, id) {
    return new Promise(function (resolve, reject) {
      res.getConnection(function (err, connection) {
        connection.query(
          'SELECT * FROM live_stream WHERE stream_id = ?',
          [id],
          function (err, results) {
            if (err) {
              resolve(err);
            }
            resolve(results);
          },
        );
      });
    });
  },

  createLiveStreamByApi: function (req, res) {
    return new Promise(function (resolve, reject) {
      req.getConnection(function (err, connection) {
        let insertData = [];
        const data = req?.body;
        const poster = `/images/upload/images/lives/posters/${req.fileName}`;
        const recordingPath = `/recording/${data.stream_id}.mp4`;
        insertData.push(data.stream_id);
        insertData.push(data.user_id);
        insertData.push(data.stream_url);
        insertData.push(poster);
        insertData.push(data.name);
        insertData.push(data.description);
        insertData.push(recordingPath);
        insertData.push(data.status);
        insertData.push(dateTime.create().format('Y-m-d H:M:S'));
        let sql =
          'INSERT INTO `live_stream`( `stream_id`, `user_id`, `stream_url`, `poster`, `name`, `description`, `recording`, `status`,`creation_date`) VALUES (?,?,?,?,?,?,?,?,?)';
        connection.query(sql, insertData, function (err, results) {
          if (!err) {
            resolve(results);
          } else {
            console.log(err);
            reject(err);
          }
        });
      });
    });
  },
};
