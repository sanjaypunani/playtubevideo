import ReactPlayer from 'react-player';
import { ChatRoomBox } from './ChatRoomBox';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

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
  console.log('stream url', liveStreamUrl);
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
                {liveStreamUrl && (
                  <ReactPlayer
                    ref={liveRef}
                    height={'100%'}
                    width={'100vw'}
                    style={{ objectFit: 'cover' }}
                    url={liveStreamUrl}
                    playing={playing}
                    muted={mutedStream}
                    controls={true}
                    onReady={() => {
                      setPlaying(true);
                      setMutedStream(false);
                      console.log('get ready');
                    }}
                  />
                )}
              </div>
            ) : (
              <div style={{ height: 'calc(100vh - 80px)', marginBottom: 132 }}>
                {recordingUrl && (
                  <ReactPlayer
                    height={'100%'}
                    width={'100vw'}
                    style={{ objectFit: 'cover' }}
                    url={recordingUrl}
                    playing
                    controls={true}
                  />
                )}
              </div>
            )}

            <div className="footer-view">
              <div />
              <button
                type="button"
                data-dismiss="modal"
                onClick={() => {
                  setLiveStreamUrl(null);
                  setRecordingUrl(null);
                  setStreamData(null);
                  handleClose();
                }}
              >
                Back
              </button>
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
