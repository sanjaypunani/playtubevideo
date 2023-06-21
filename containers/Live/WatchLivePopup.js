import ReactPlayer from 'react-player';
import { ChatRoomBox } from './ChatRoomBox';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

let globalMessages = [];

export const WatchLivePopup = ({ handleClose, open, data, socket }) => {
  console.log('data: ', data);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [streamData, setStreamData] = useState();
  const [liveStreamUrl, setLiveStreamUrl] = useState();
  const [recordingUrl, setRecordingUrl] = useState();
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
      setLiveStreamUrl(
        `${window?.location?.protocol}//${window?.location?.hostname}:${
          window.location.protocol === 'https:' ? '8443' : '8000'
        }/live/${streamData?.stream_id}.flv`,
      );
      socket.on('newMessage', message => {
        globalMessages.push(message);
        setMessages([...globalMessages]);
      });
      socket.emit('joinLiveStream', streamData?.stream_id);

      setRecordingUrl(`${window?.location?.origin}${streamData?.recording}`);
    }
  }, [streamData]);

  return (
    <div className={`modal fade ${open ? 'show' : 'show'}`} id="watchlivepopup">
      <div className="modal-dialog modal-md modal-dialog-centered modal-xl popupDesign full-screen-dialog">
        <div className="modal-content">
          <div className="main-view-live">
            {streamData && streamData?.status === 'live' ? (
              <div className="camera-view">
                <ReactPlayer
                  height={'100vh'}
                  width={'100vw'}
                  style={{ objectFit: 'cover' }}
                  url={liveStreamUrl}
                  playing
                  controls={false}
                />
              </div>
            ) : (
              <div style={{ height: '100%', marginBottom: 132 }}>
                <ReactPlayer
                  height={'100%'}
                  width={'100vw'}
                  style={{ objectFit: 'cover' }}
                  url={recordingUrl}
                  playing
                  controls={true}
                />
              </div>
            )}

            <div className="footer-view">
              <div />
              <button
                type="button"
                data-dismiss="modal"
                onClick={() => {
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
