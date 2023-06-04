import { useEffect, useRef, useState } from 'react';

export const StreamPopup = ({ handleClose, open, socket }) => {
  const videoRef = useRef();
  const [streamStarted, setStreamStarted] = useState(false);
  const [localStream, setLocalStream] = useState();
  const [mediaRecorder, setMediaRecorder] = useState();

  const startCamera = async () => {
    let stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const startStream = async () => {
    try {
      socket.emit('startStream', { path: '/live/stream1' });
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

  return (
    <div className={`modal fade ${open ? 'show' : ''}`} id="golivepopup">
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
                <button type="button" data-dismiss="modal" onClick={stopStream}>
                  End
                </button>
              </div>
            )}

            {!streamStarted && (
              <div className="start-top-layer">
                <button onClick={startStream}>Start stream now!</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
