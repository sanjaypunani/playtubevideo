import React, { useEffect, useState } from 'react';
import { StreamPopup } from './StreamPopup';
import './livestream.css';
import { WatchLivePopup } from './WatchLivePopup';
import axios from 'axios';
import { CreateStreamPopup } from './CreateStreamPopup';
import moment from 'moment';
import { WatchLiveRecording } from './WatchLiveRecording';

export const LiveMainPage = ({ socket }) => {
  const [showLiveModel, setShowLiveModel] = useState(false);
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [showWatchRecording, setShowWatchRecording] = useState(false);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [createStreamData, setCreateStreamData] = useState();
  const [lives, setLives] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [watchLiveData, setWatchLiveData] = useState();

  const getLiveStreams = () => {
    const url = '/api/lives?status=live';
    axios.get(url).then(res => {
      setLives(res?.data?.streams);
    });
  };

  const getRecordedStreams = () => {
    const url = '/api/lives?status=end';
    axios.get(url).then(res => {
      setRecordings(res?.data?.streams);
    });
  };

  useEffect(() => {
    getLiveStreams();
    getRecordedStreams();
    socket.on('update_live', () => {
      getLiveStreams();
      getRecordedStreams();
    });
  }, []);

  const StreamVideoCard = ({ item }) => {
    return (
      <div
        onClick={() => {
          setWatchLiveData(item);
          if (item?.status === 'live') {
            setShowWatchLive(true);
          } else {
            setShowWatchRecording(true);
          }
        }}
        data-toggle="modal"
        data-target={
          item?.status === 'live' ? '#watchlivepopup' : '#watchrecordingepopup'
        }
        className="live-card"
      >
        <div className="stream-image-div">
          <img
            src={`${window.location.origin}${item?.poster}`}
            alt="streamposter"
            className="stream-image-card"
          />
          {item?.status === 'live' && (
            <div className="live-lable-vide">
              <span className="live-lable">Live</span>
            </div>
          )}
        </div>
        <h6 className="stream-title">{item?.name}</h6>
        <span className="stream-details">{item?.description}</span>
        <span className="stream-date">
          {moment(item?.creation_date).format('DD/MM/YYYY hh:mm')}
        </span>
      </div>
    );
  };
  return (
    <React.Fragment>
      <div className="user-area live-page-main">
        <button
          onClick={() => setShowCreateStream(true)}
          data-toggle="modal"
          data-target="#createstreampopup"
        >
          Create Stream
        </button>

        <button
          style={{ display: 'none' }}
          id="go-live-hidden-button"
          onClick={() => setShowLiveModel(true)}
          data-toggle="modal"
          data-target="#golivepopup"
        >
          Go Live
        </button>
        <div style={{ height: 18 }} />
        <h3>Lives</h3>
        <div className="row">
          {lives &&
            lives?.map(live => {
              return (
                <div className="col-md-3">
                  <StreamVideoCard item={live} />
                </div>
              );
            })}
        </div>

        <div style={{ height: 18 }} />
        <h3>Recordings</h3>
        <div className="row">
          {recordings &&
            recordings?.map(live => {
              return (
                <div className="col-md-3">
                  <StreamVideoCard item={live} />
                </div>
              );
            })}
        </div>

        {showLiveModel && (
          <StreamPopup
            socket={socket}
            open={showLiveModel}
            streamData={createStreamData}
            handleClose={() => setShowLiveModel(false)}
          />
        )}

        {showWatchLive && (
          <WatchLivePopup
            socket={socket}
            open={showWatchLive}
            data={watchLiveData}
            handleClose={() => setShowWatchLive(false)}
          />
        )}

        {showWatchRecording && (
          <WatchLiveRecording
            socket={socket}
            open={showWatchRecording}
            data={watchLiveData}
            handleClose={() => setShowWatchRecording(false)}
          />
        )}

        {showCreateStream && (
          <CreateStreamPopup
            open={showCreateStream}
            handleClose={data => {
              if (data?.isSuccess) {
                setCreateStreamData(data?.streamData);
                setShowCreateStream(false);
                const liveButton = document.getElementById(
                  'go-live-hidden-button',
                );
                liveButton.click();
              }
            }}
          />
        )}
      </div>
    </React.Fragment>
  );
};
