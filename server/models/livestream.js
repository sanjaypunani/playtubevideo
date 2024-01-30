const dateTime = require('node-datetime');
const moment = require('moment');
const categoriesModel = require('./categories');

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
      req.getConnection(async function (err, connection) {
        const host = req?.headers?.host;
        let subDomain = host.toLocaleLowerCase().split('.')?.[0];

        let fourceCategory = null;

        if (subDomain) {
          fourceCategory = await categoriesModel.findBySlug(
            { slug: subDomain },
            req,
          );
        }

        const status = req?.query?.status;
        const user = req?.query?.user;
        let query = 'SELECT * FROM live_stream';
        if (status) {
          query = query + ` WHERE status = '${status}'`;
          if (status === 'schedule') {
            query = query + ` AND owner = ${req?.user?.user_id || -1}`;
          }

          if (user === 'me') {
            query = query + ` AND owner = ${req?.user?.user_id || -1}`;
          }
        }

        if (fourceCategory) {
          query = query + ` AND category = ${fourceCategory?.category_id}`;
        }

        console.log('get sql quary', query);
        connection.query(query, function (err, results) {
          if (err) {
            console.log('err: ', err);
            reject(err);
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
    return new Promise(async function (resolve, reject) {
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
        const recordingPath = `/recording/${data.stream_id}/${data.stream_id}.m3u8`;
        insertData.push(data.stream_id);
        insertData.push(data.user_id);
        insertData.push(data.stream_url);
        insertData.push(poster);
        insertData.push(data.name);
        insertData.push(data.description);
        insertData.push(recordingPath);
        insertData.push(data.status);
        insertData.push(
          moment(data.schedule_date_time).format('YYYY-MM-DD HH:mm:ss'),
        );
        insertData.push(req.user.user_id || 0);
        insertData.push(dateTime.create().format('Y-m-d H:M:S'));
        insertData.push(data?.category);
        let sql =
          'INSERT INTO `live_stream`( `stream_id`, `user_id`, `stream_url`, `poster`, `name`, `description`, `recording`, `status`, `schedule_date_time`, `owner`, `creation_date`, `category`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
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

  updateLivebyApi: function (req, res) {
    return new Promise(function (resolve, reject) {
      req.getConnection(function (err, connection) {
        let queryValue = req.params.stream_id;
        const objectData = req?.body;
        const updateColumns = Object.keys(objectData)
          .map(column => `${column} = '${objectData[column]}'`)
          .join(', ');
        let updateQuery = `UPDATE ${'live_stream'} SET ${updateColumns} WHERE stream_id = '${queryValue}'`;

        connection.query(updateQuery, function (err, results) {
          if (!err) {
            console.log('Update stream success');
            resolve(results);
          } else {
            console.log(err);
            reject(err);
          }
        });
      });
    });
  },

  updateLivebyConnections: function (connection, data) {
    return new Promise(function (resolve, reject) {
      if (data?.stream_id) {
        let queryValue = data?.stream_id;

        let objectData = { ...data };
        delete objectData.stream_id;
        const updateColumns = Object.keys(objectData)
          .map(column => `${column} = '${objectData[column]}'`)
          .join(', ');
        let updateQuery = `UPDATE ${'live_stream'} SET ${updateColumns} WHERE stream_id = '${queryValue}'`;

        connection.query(updateQuery, function (err, results) {
          if (!err) {
            console.log('Update stream success');
            resolve(results);
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
  },
};
