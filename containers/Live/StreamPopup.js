import { useEffect, useRef, useState } from 'react';
import { ChatRoomBox } from './ChatRoomBox';

let globalMessages = [];

export const StreamPopup = ({ handleClose, open, socket, streamData }) => {
  const videoRef = useRef();
  const [streamStarted, setStreamStarted] = useState(false);
  const [localStream, setLocalStream] = useState();
  const [mediaRecorder, setMediaRecorder] = useState();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  globalMessages = messages;

  const setMediaForNonIos = async () => {
    let stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const setMediaForIos = async () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(
      `<video id="iosVideo" autoplay playsinline style="object-fit: contain;"></video>`,
    );
    iframeDoc.close();

    const iosVideo = iframeDoc.getElementById('iosVideo');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      iosVideo.srcObject = mediaStream;
    } catch (error) {
      console.log('Error accessing webcam on iOS:', error);
    }

    videoRef.current.srcObject = iosVideo.srcObject;
    videoRef.current.play();
    videoRef.current.playsInline = true;
  };

  const startCamera = async () => {
    const iOS =
      !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if (iOS) {
      setMediaForIos();
    } else {
      setMediaForNonIos();
    }
  };

  const startStream = async () => {
    try {
      socket.emit('startStream', {
        stream_url: streamData?.stream_url,
        stream_id: streamData?.stream_id,
      });
      setStreamStarted(true);
      let recorder = new MediaRecorder(localStream);

      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          socket.emit('streamData', event.data);
        }
      };
      recorder.start(100);
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };
  const stopStream = () => {
    socket.emit('streamEnd');
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    handleClose();
  };
  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    socket.on('newMessage', message => {
      globalMessages.push(message);
      setMessages([...globalMessages]);
    });

    socket.emit('joinLiveStream', streamData?.stream_id.toString());
  }, []);

  return (
    <div className={`modal ${open ? 'show' : ''}`} id="golivepopup">
      <div className="modal-dialog modal-md modal-dialog-centered modal-xl popupDesign full-screen-dialog">
        <div className="modal-content">
          <div className="main-view-live">
            {/* Camera View */}
            <div className="camera-view">
              <video className="video-item" ref={videoRef} muted />
            </div>

            {/* Footer */}
            {streamStarted && (
              <div className="footer-view">
                <div />
                <button type="button" data-dismiss="modal" onClick={stopStream}>
                  End
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
            )}

            {!streamStarted && (
              <div className="start-top-layer">
                <button onClick={startStream}>Start stream now!</button>
              </div>
            )}

            {showChat && (
              <ChatRoomBox
                messages={messages}
                streamData={{
                  ...streamData,
                  stream_id: streamData?.stream_id.toString(),
                }}
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
