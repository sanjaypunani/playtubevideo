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

  getLiveStream: function (res) {
    return new Promise(function (resolve, reject) {
      res.getConnection(function (err, connection) {
        connection.query('SELECT * FROM live_stream', function (err, results) {
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
};
