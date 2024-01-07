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

export const LiveMainPage = ({ socket, subDomainCategory }) => {
  const router = useRouter();
  const { pageInfoData } = useSelector(state => state.general);

  const params = router.query;

  const [showScheduledStream, setShowScheduledStream] = useState(false);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [scheduledStreamData, setSchedulesStreamData] = useState();
  const [lives, setLives] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [myRecordings, setMyRecording] = useState([]);
  const [recordings, setRecordings] = useState([]);

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

  const getMyRecordedStreams = () => {
    const url = '/api/lives?status=end&user=me';
    axios.get(url).then(res => {
      setMyRecording(res?.data?.streams);
    });
  };

  const getPageData = () => {
    getLiveStreams();
    getRecordedStreams();
    getScheduledStream();
    getMyRecordedStreams();
  };

  useEffect(() => {
    getPageData();
    socket.on('update_live', () => {
      getPageData();
    });
  }, []);

  useEffect(() => {
    if (params?.watch) {
      const liveButton = document.getElementById(`watch-live-hidden-button`);
      liveButton.click();
    }
  }, [params]);

  const onDeleteStream = stream_id => {
    const url = `/api/lives/${stream_id}`;
    axios.delete(url).then(res => {
      getPageData();
    });
  };

  const StreamVideoCard = ({ item, isMy }) => {
    return (
      <div
        onClick={() => {
          if (item?.status === 'schedule') {
            router.push(`/live/create?stream_id=${item?.stream_id}`);
          } else {
            router.push(`/live/join?stream_id=${item?.stream_id}`);
          }
        }}
        data-toggle="modal"
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
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h6 className="stream-title">{item?.name}</h6>
            <span className="stream-details">{item?.description}</span>
            <span className="stream-date">
              {moment(item?.creation_date).format('DD/MM/YYYY hh:mm')}
            </span>
          </div>

          {item?.status === 'schedule' && (
            <button
              onClick={e => {
                const watchUrl = `${window.location.origin}/live/join?stream_id=${item?.stream_id}`;
                e.stopPropagation();
                navigator.clipboard.writeText(watchUrl);
              }}
              style={{ height: 38, marginTop: 12 }}
            >
              Copy
            </button>
          )}

          {isMy && (
            <button
              onClick={e => {
                e.stopPropagation();
                onDeleteStream(item?.stream_id);
              }}
              style={{ height: 38, marginTop: 12 }}
            >
              Delete
            </button>
          )}
        </div>
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
              All Recordings
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

        <div style={{ height: 18 }} />
        <div className="titleWrap">
          <span className="title">
            <React.Fragment>
              <span className="recent_video">
                <span className="material-icons">video_library</span>
              </span>
              My Recordings
            </React.Fragment>
          </span>
        </div>
        <div className="row">
          {myRecordings &&
            myRecordings?.map(live => {
              return (
                <div className="col-md-3">
                  <StreamVideoCard isMy={true} item={live} />
                </div>
              );
            })}
        </div>

        {showCreateStream && (
          <CreateStreamPopup
            open={showCreateStream}
            subDomainCategory={subDomainCategory}
            handleClose={data => {
              getPageData();
            }}
          />
        )}
      </div>
    </React.Fragment>
  );
};
