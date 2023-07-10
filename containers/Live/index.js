'use client';
import React, { useEffect, useState } from 'react';
import { StreamPopup } from './StreamPopup';
import './livestream.css';
import { WatchLivePopup } from './WatchLivePopup';
import axios from 'axios';
import { CreateStreamPopup } from './CreateStreamPopup';
import moment from 'moment';
import { WatchLiveRecording } from './WatchLiveRecording';
import { useRouter } from 'next/router';
import { ScheduledStreamPopup } from './ScheduledStreamPopup';
import Router from 'next/router';
import { useSelector } from 'react-redux';

export const LiveMainPage = ({ socket }) => {
  const router = useRouter();
  const { pageInfoData } = useSelector(state => state.general);

  const params = router.query;

  const [showLiveModel, setShowLiveModel] = useState(false);
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [showScheduledStream, setShowScheduledStream] = useState(false);
  const [showWatchRecording, setShowWatchRecording] = useState(false);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [createStreamData, setCreateStreamData] = useState();
  const [scheduledStreamData, setSchedulesStreamData] = useState();
  const [lives, setLives] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [watchLiveData, setWatchLiveData] = useState();

  const getLiveStreams = () => {
    const url = '/api/lives?status=live';
    axios.get(url).then(res => {
      setLives(res?.data?.streams);
    });
  };

  const getScheduledStream = () => {
    const url = '/api/lives?status=schedule';
    axios.get(url).then(res => {
      setSchedules(res?.data?.streams);
    });
  };

  const getRecordedStreams = () => {
    const url = '/api/lives?status=end';
    axios.get(url).then(res => {
      setRecordings(res?.data?.streams);
    });
  };

  const getPageData = () => {
    getLiveStreams();
    getRecordedStreams();
    getScheduledStream();
  };

  useEffect(() => {
    getPageData();
    socket.on('update_live', () => {
      getPageData();
    });
  }, []);

  useEffect(() => {
    if (params?.watch) {
      setWatchLiveData({ stream_id: params?.watch });
      const liveButton = document.getElementById(`watch-live-hidden-button`);
      liveButton.click();
    }
  }, [params]);

  const StreamVideoCard = ({ item }) => {
    return (
      <div
        // id={`watchlivepopup_${item?.stream_id}`}
        onClick={() => {
          setWatchLiveData(item);

          if (item?.status === 'live') {
            setShowWatchLive(true);
          } else if (item?.status === 'schedule') {
            setSchedulesStreamData(item);
            setShowScheduledStream(true);
          } else {
            setShowWatchRecording(true);
          }
        }}
        data-toggle="modal"
        data-target={
          item?.status === 'live'
            ? '#watchlivepopup'
            : item?.status === 'schedule'
            ? '#scheduledstreampopup'
            : '#watchrecordingepopup'
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
          onClick={() => {
            if (pageInfoData?.loggedInUserDetails) {
              setShowCreateStream(true);
            }
          }}
          data-toggle="modal"
          data-target={
            pageInfoData?.loggedInUserDetails
              ? '#createstreampopup'
              : '#loginpop'
          }
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

        <button
          style={{ display: 'none' }}
          id="watch-live-hidden-button"
          onClick={() => setShowWatchLive(true)}
          data-toggle="modal"
          data-target="#watchlivepopup"
        >
          watchh auto stream
        </button>
        <div style={{ height: 18 }} />
        <div className="titleWrap">
          <span className="title">
            <React.Fragment>
              <span className="recent_video">
                <span className="material-icons">video_library</span>
              </span>
              My Schedules
            </React.Fragment>
          </span>
        </div>
        <div className="row">
          {schedules &&
            schedules?.map(live => {
              return (
                <div className="col-md-3">
                  <StreamVideoCard item={live} />
                </div>
              );
            })}
        </div>
        <div style={{ height: 18 }} />

        <div className="titleWrap">
          <span className="title">
            <React.Fragment>
              <span className="recent_video">
                <span className="material-icons">video_library</span>
              </span>
              Lives
            </React.Fragment>
          </span>
        </div>

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
        <div className="titleWrap">
          <span className="title">
            <React.Fragment>
              <span className="recent_video">
                <span className="material-icons">video_library</span>
              </span>
              Recordings
            </React.Fragment>
          </span>
        </div>
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
            handleClose={() => {
              getPageData();
              setShowLiveModel(false);
            }}
          />
        )}

        {/* {showWatchLive && ( */}
        <WatchLivePopup
          socket={socket}
          open={showWatchLive}
          data={watchLiveData}
          handleClose={() => {
            window.location.href = `${window.location.origin}/live`;
            getPageData();
            setShowWatchLive(false);
          }}
        />
        {/* )} */}

        {showWatchRecording && (
          <WatchLiveRecording
            socket={socket}
            open={showWatchRecording}
            data={watchLiveData}
            handleClose={() => {
              window.location.href = `${window.location.origin}/live`;
              getPageData();
              setShowWatchRecording(false);
            }}
          />
        )}

        {showScheduledStream && (
          <ScheduledStreamPopup
            socket={socket}
            open={showScheduledStream}
            data={scheduledStreamData}
            handleClose={data => {
              getPageData();
              if (data?.isSuccess) {
                setCreateStreamData(data?.streamData);
                setSchedulesStreamData(data?.streamData);
                setSchedulesStreamData(false);
                const liveButton = document.getElementById(
                  'go-live-hidden-button',
                );
                liveButton.click();
              }
            }}
          />
        )}

        {showCreateStream && (
          <CreateStreamPopup
            open={showCreateStream}
            handleClose={data => {
              getPageData();
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
