import { useEffect, useRef, useState } from 'react';
import { ChatRoomBox } from './ChatRoomBox';

let globalMessages = [];
var camMode = 'user';

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
      video: { facingMode: mode },
      audio: true,
    });
    setLocalStream(stream);
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const setMediaForIos = async mode => {
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
        video: { facingMode: mode },
        audio: true,
      });
      iosVideo.srcObject = mediaStream;
      iosVideo.muted = true;
    } catch (error) {
      console.log('Error accessing webcam on iOS:', error);
    }
    if (iosVideo && videoRef.current) {
      console.log('get set now');
      setLocalStream(iosVideo?.srcObject);
      videoRef.current.srcObject = iosVideo?.srcObject;
      videoRef.current.play();
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
    }
  };

  const startCamera = async mode => {
    const iOS =
      !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if (iOS) {
      setMediaForIos(mode);
    } else {
      setMediaForNonIos(mode);
    }
  };

  const startStream = async () => {
    try {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      socket.emit('startStream', {
        stream_url: streamData?.stream_url,
        stream_id: streamData?.stream_id,
      });
      setStreamStarted(true);
      let recorder = new MediaRecorder(localStream);

      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          console.log('event.data: ', event.data);

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
    startCamera('user');
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (localStream && streamStarted) {
      startStream();
    }
    console.log('get change localStream');
  }, [localStream]);

  useEffect(() => {
    socket.on('newMessage', message => {
      globalMessages.push(message);
      setMessages([...globalMessages]);
    });

    socket.emit('joinLiveStream', streamData?.stream_id.toString());
  }, []);

  const handleCameraSwitch = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());

      camMode = camMode === 'user' ? 'environment' : 'user';
      localStream.getTracks().forEach(track => track.stop());
      startCamera(camMode);
    } else {
      alert('localstream not found');
    }
  };

  return (
    <div className={`modal ${open ? 'show' : ''}`} id="golivepopup">
      <div className="modal-dialog modal-md modal-dialog-centered modal-xl popupDesign full-screen-dialog">
        <div className="modal-content">
          <div className="main-view-live">
            {/* Camera View */}
            <div className="camera-view">
              <video
                playsInline={true}
                className="video-item"
                ref={videoRef}
                muted
              />
            </div>

            {/* Footer */}
            {streamStarted && (
              <div className="footer-view">
                <div
                  onClick={() => handleCameraSwitch()}
                  className="chat-icon-button"
                >
                  <i
                    style={{ fontSize: 24, color: 'white' }}
                    class="fa fa-camera"
                  ></i>
                </div>
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
                <button onClick={() => setStreamStarted(true)}>
                  Start stream now!
                </button>
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
