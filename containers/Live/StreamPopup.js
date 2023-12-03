import { useEffect, useRef, useState } from 'react';
import { ChatRoomBox } from './ChatRoomBox';

let globalMessages = [];

export const StreamPopup = ({ handleClose, open, socket, streamData }) => {
  const videoRef = useRef();
  const [streamStarted, setStreamStarted] = useState(false);
  const [streamEventSentToServer, setStreamEventSentToServer] = useState(false);
  const [localStream, setLocalStream] = useState();
  const [mediaRecorder, setMediaRecorder] = useState();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeCamera, setActiveCamera] = useState('user');
  const [cameraDevices, setCameraDevices] = useState([
    {
      lable: 'Front Camera',
      devicesId: 'front',
      facingMode: 'user',
    },
    {
      lable: 'Back Camera',
      devicesId: 'back',
      facingMode: 'environment',
    },
  ]);

  globalMessages = messages;

  const setMediaForNonIos = async mode => {
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
      mediaStream.getVideoTracks()[0].getSettings;
      iosVideo.muted = true;
    } catch (error) {
      console.log('Error accessing webcam on iOS:', error);
    }
    if (iosVideo && videoRef.current) {
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
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      if (!streamEventSentToServer) {
        setStreamEventSentToServer(true);
        socket.emit('startStream', {
          stream_url: streamData?.stream_url,
          stream_id: streamData?.stream_id,
        });
      } else {
        socket.emit('changeCamera');
      }

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
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    startCamera(activeCamera);
  }, [activeCamera]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (localStream && streamStarted) {
      startStream();
    }
  }, [streamStarted, localStream]);

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
                <i
                  style={{ color: 'gray', fontSize: 36, cursor: 'pointer' }}
                  class="fa fa-window-close"
                  aria-hidden="true"
                  onClick={stopStream}
                ></i>

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
                <div style={{ padding: 22 }} className="container">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                    className="row"
                  >
                    {cameraDevices?.map(item => {
                      return (
                        <div
                          onClick={() => setActiveCamera(item.facingMode)}
                          className="camera-select-box"
                          style={{
                            backgroundColor:
                              activeCamera === item?.facingMode
                                ? 'white'
                                : 'gray',
                          }}
                        >
                          <i
                            style={{
                              color:
                                activeCamera === item?.facingMode
                                  ? 'black'
                                  : 'white',
                            }}
                            className="fa fa-camera camera-icon"
                          ></i>
                          <span
                            style={{
                              color:
                                activeCamera === item?.facingMode
                                  ? 'black'
                                  : 'white',
                            }}
                            className="camera-name-text"
                          >
                            {item?.lable}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  style={{ marginTop: 22 }}
                  onClick={() => setStreamStarted(true)}
                >
                  Start Stream
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
