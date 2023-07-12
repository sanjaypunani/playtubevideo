import moment from 'moment';
import { useState } from 'react';

export const ChatRoomBox = ({ handleClose, socket, messages, streamData }) => {
  const [messageText, setMessageText] = useState('');

  const onSendMessage = () => {
    const messageObject = {
      message: messageText,
      user: null,
      createAt: new Date(),
      stream_id: streamData?.stream_id,
    };
    socket.emit('newStreamMessage', messageObject);
    setMessageText('');
  };
  return (
    <div className="chat-box-main">
      <div className="chat-message-list">
        <div className="close-row-view">
          <button
            style={{ color: 'white', height: 32, width: 32 }}
            onClick={handleClose}
            type="button"
            className="close"
          >
            &times;
          </button>
        </div>
        {messages?.map(item => {
          return (
            <div style={{ marginBottom: 12 }}>
              <div className="message-box">
                <span className="message-text">{item?.message}</span>
              </div>
              <span className="date-text">
                {moment(item.createAt).format('DD/MM/YYYY hh:mm')}
              </span>
            </div>
          );
        })}
      </div>
      <div className="footer-chat">
        <div className="close-row-view">
          <button
            style={{ color: 'white', height: 32, width: 32 }}
            onClick={handleClose}
            type="button"
            className="close"
          >
            &times;
          </button>
        </div>

        <input
          onChange={e => setMessageText(e.target.value)}
          value={messageText}
          placeholder="Type message here..."
          className="message-input"
        />
        <button onClick={onSendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};
