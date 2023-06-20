import ReactPlayer from 'react-player';
import { ChatRoomBox } from './ChatRoomBox';
import { useEffect, useState } from 'react';

let globalMessages = [];

export const WatchLivePopup = ({ handleClose, open, data, socket }) => {
  console.log('data: ', data);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  globalMessages = messages;

  const streamUrl = `${window?.location?.protocol}//${
    window?.location?.hostname
  }:${window.location.protocol === 'https:' ? '8443' : '8000'}/live/${
    data?.stream_id
  }.flv`;

  console.log('streamUrl: ', streamUrl);

  useEffect(() => {
    socket.on('newMessage', message => {
      globalMessages.push(message);
      setMessages([...globalMessages]);
    });

    socket.emit('joinLiveStream', data?.stream_id);
  }, []);

  return (
    <div className={`modal fade ${open ? 'show' : ''}`} id="watchlivepopup">
      <div className="modal-dialog modal-md modal-dialog-centered modal-xl popupDesign full-screen-dialog">
        <div className="modal-content">
          <div className="main-view-live">
            <div className="camera-view">
              <ReactPlayer
                height={'100vh'}
                width={'100vw'}
                style={{ objectFit: 'cover' }}
                url={streamUrl}
                playing
                controls={false}
              />
            </div>

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
              <div
                onClick={() => setShowChat(true)}
                className="chat-icon-button"
              >
                <i
                  class="fas fa-comment"
                  style={{ fontSize: 24, color: 'white' }}
                ></i>
              </div>
            </div>

            {showChat && (
              <ChatRoomBox
                messages={messages}
                streamData={data}
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
