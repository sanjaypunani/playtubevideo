import ReactPlayer from 'react-player';
import { ChatRoomBox } from './ChatRoomBox';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

let globalMessages = [];

export const WatchLivePopup = ({ handleClose, open, data, socket }) => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [streamData, setStreamData] = useState();
  const [liveStreamUrl, setLiveStreamUrl] = useState();
  const [recordingUrl, setRecordingUrl] = useState();
  const [mutedStream, setMutedStream] = useState(true);
  const [playing, setPlaying] = useState(false);
  const liveRef = useRef();
  globalMessages = messages;

  const getStreamData = () => {
    const url = `/api/lives/${data?.stream_id}`;
    axios.get(url).then(res => {
      setStreamData(res?.data?.stream);
    });
  };

  useEffect(() => {
    if (data) {
      getStreamData();
    }
  }, [data]);

  useEffect(() => {
    if (streamData) {
      socket.on('newMessage', message => {
        globalMessages.push(message);
        setMessages([...globalMessages]);
      });
      socket.emit('joinLiveStream', streamData?.stream_id);
      setLiveStreamUrl(
        `${window?.location?.protocol}//${window?.location?.hostname}:${
          window.location.protocol === 'https:' ? '8443' : '8000'
        }/live/${streamData?.stream_id}.flv`,
      );
      setRecordingUrl(`${window?.location?.origin}${streamData?.recording}`);
    }
  }, [streamData]);

  return (
    <div className={`modal fade ${open ? 'show' : 'show'}`} id="watchlivepopup">
      <div className="modal-dialog modal-md modal-dialog-centered modal-xl popupDesign full-screen-dialog">
        <div className="modal-content">
          <div className="main-view-live">
            {streamData && streamData?.status === 'live' ? (
              <div
                style={{ height: 'calc(100vh - 80px)', marginBottom: 132 }}
                className="camera-view"
              >
                {recordingUrl && (
                  // <ReactPlayer
                  //   ref={liveRef}
                  //   height={'100%'}
                  //   playsinline={true}
                  //   width={'100vw'}
                  //   style={{ objectFit: 'cover' }}
                  //   url={recordingUrl}
                  //   playing={playing}
                  //   muted={mutedStream}
                  //   controls={true}
                  //   onReady={() => {
                  //     setPlaying(true);
                  //     setMutedStream(false);
                  //   }}
                  // />
                  <iframe
                    // style={{width: '100%', border: 'none', height: '100%'}}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      border: 'none',
                    }}
                    src={`https://storage1.inqtube.com/gnxPlayer/public/gplr2.html?path=${recordingUrl}&autoplay=true`}
                    allowFullScreen=""
                    playsInline
                    allow="autoplay; fullscreen; picture-in-picture; xr-spatial-tracking; encrypted-media"
                  />
                )}
              </div>
            ) : (
              <div style={{ height: 'calc(100vh - 80px)', marginBottom: 132 }}>
                {streamData?.status !== 'schedule' ? (
                  recordingUrl && (
                    // <ReactPlayer
                    //   playsinline={true}
                    //   height={'100%'}
                    //   width={'100vw'}
                    //   style={{ objectFit: 'cover' }}
                    //   url={recordingUrl}
                    //   playing
                    //   controls={true}
                    // />
                    <iframe
                      // style={{width: '100%', border: 'none', height: '100%'}}
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        border: 'none',
                      }}
                      src={`https://storage1.inqtube.com/gnxPlayer/public/gplr2.html?path=${recordingUrl}&autoplay=true`}
                      allowFullScreen=""
                      playsInline
                      allow="autoplay; fullscreen; picture-in-picture; xr-spatial-tracking; encrypted-media"
                    />
                  )
                ) : (
                  <div className="stream-not-start-div">
                    <h2 className="stream-not-start-text">
                      {`Stream will be start at ${moment(
                        streamData?.schedule_date_time,
                      ).format('DD MMMM hh:mm A')}`}
                    </h2>
                  </div>
                )}
              </div>
            )}

            <div className="footer-view">
              <i
                style={{ color: 'gray', fontSize: 36, cursor: 'pointer' }}
                class="fa fa-window-close"
                aria-hidden="true"
                onClick={() => {
                  setLiveStreamUrl(null);
                  setRecordingUrl(null);
                  setStreamData(null);
                  handleClose();
                }}
              ></i>
              {streamData?.status === 'live' ? (
                <div
                  onClick={() => setShowChat(true)}
                  className="chat-icon-button"
                >
                  <i
                    class="fas fa-comment"
                    style={{ fontSize: 24, color: 'white' }}
                  ></i>
                </div>
              ) : (
                <div />
              )}
            </div>

            {showChat && streamData && (
              <ChatRoomBox
                messages={messages}
                streamData={streamData}
                socket={socket}
                handleClose={() => setShowChat(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
