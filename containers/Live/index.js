import React, { useEffect, useState } from 'react';
import { StreamPopup } from './StreamPopup';
import './livestream.css';
import { WatchLivePopup } from './WatchLivePopup';
import axios from 'axios';

export const LiveMainPage = ({ socket }) => {
  const [showLiveModel, setShowLiveModel] = useState(false);
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [lives, setLives] = useState([]);
  const [watchLiveData, setWatchLiveData] = useState();

  const getLiveStreams = () => {
    const url = '/api/lives';
    axios.get(url).then(res => {
      setLives(res?.data?.streams);
    });
  };

  useEffect(() => {
    getLiveStreams();
    socket.on('update_live', () => {
      getLiveStreams();
    });
  }, []);
  return (
    <React.Fragment>
      <div className="user-area">
        <button
          onClick={() => setShowLiveModel(true)}
          data-toggle="modal"
          data-target="#golivepopup"
        >
          Go Live
        </button>

        <div className="row">
          {lives &&
            lives?.map(live => {
              return (
                <div className="col-md-3">
                  <div
                    onClick={() => {
                      setWatchLiveData(live);
                      setShowWatchLive(true);
                    }}
                    data-toggle="modal"
                    data-target="#watchlivepopup"
                    className="live-card card"
                  >
                    <h2>{live?.stream_id}</h2>
                  </div>
                </div>
              );
            })}
        </div>

        {showLiveModel && (
          <StreamPopup
            socket={socket}
            open={showLiveModel}
            handleClose={() => setShowLiveModel(false)}
          />
        )}

        {showWatchLive && (
          <WatchLivePopup
            open={showWatchLive}
            data={watchLiveData}
            handleClose={() => setShowWatchLive(false)}
          />
        )}
      </div>
    </React.Fragment>
  );
};
