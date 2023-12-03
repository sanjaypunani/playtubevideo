'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './livestream.css';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import { ChatRoomBox } from './ChatRoomBox';
import moment from 'moment';

const cameraDevices = [
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
];

let globalMessages = [];

let globalSlug;

export const GoWatchLive = ({ socket, pageData }) => {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [playingUrl, setPlayingUrl] = useState();
  const [streamStarted, setStreamStarted] = useState(false);
  const [activeCamera, setActiveCamera] = useState('user');
  const [localStream, setLocalStream] = useState();
  const [streamEventSentToServer, setStreamEventSentToServer] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState();
  const [slug, setSlug] = useState();
  const videoRef = useRef();
  globalSlug = slug;

  globalMessages = messages;

  useEffect(() => {
    if (pageData?.stream) {
      setSlug(
        window.location.pathname.split('/')[
          window.location.pathname.split('/').length - 1
        ],
      );
      if (pageData?.stream?.status === 'live') {
        let liveHost = '';

        if (window.location.protocol === 'http:') {
          liveHost = 'http://localhost:8000';
        } else {
          liveHost = 'https://inqtube.com:8443';
        }
        setPlayingUrl(`${liveHost}${pageData?.stream?.stream_url}.flv`);
      } else if (pageData?.stream?.status === 'end') {
        setPlayingUrl(
          `${window?.location?.origin}${pageData?.stream?.recording}`,
        );
      }
    }
  }, [pageData?.stream]);

  useEffect(() => {
    if (pageData?.stream && pageData?.stream?.status === 'live') {
      socket.on('newMessage', message => {
        globalMessages.push(message);
        setMessages([...globalMessages]);
      });
      socket.emit('joinLiveStream', pageData?.stream?.stream_id);
    }
  }, [pageData?.stream]);

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

  const setMediaForNonIos = async mode => {
    let stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode },
      audio: true,
    });
    setLocalStream(stream);
    videoRef.current.srcObject = stream;
    videoRef.current.play();
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

  useEffect(() => {
    if (slug && slug === 'create') {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      startCamera(activeCamera);
    }
  }, [activeCamera, slug]);

  useEffect(() => {
    if (localStream && streamStarted) {
      startStream();
    }
  }, [streamStarted, localStream]);

  useEffect(() => {
    return () => {
      if (globalSlug && globalSlug === 'create') stopStream();
    };
  }, []);

  const startStream = async () => {
    try {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      if (!streamEventSentToServer) {
        setStreamEventSentToServer(true);
        socket.emit('startStream', {
          stream_url: pageData?.stream?.stream_url,
          stream_id: pageData?.stream?.stream_id,
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
      recorder.start(1000);
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
  };

  return (
    <React.Fragment>
      <div style={{ padding: 12 }} className="row">
        <div className="col col-md-8">
          <div className="live-warper">
            {playingUrl && slug && slug === 'join' && (
              <ReactPlayer
                url={playingUrl}
                className="live-video-view"
                playing
                muted
                height={'100%'}
                width={'100%'}
                onError={() => {
                  console.log('catch error');
                }}
                controls={true}
              />
            )}
            {!playingUrl && slug && slug === 'join' && (
              <h2 className="stream-not-start-text">
                {`Stream will be start at ${moment(
                  pageData?.stream?.schedule_date_time,
                ).format('DD MMMM hh:mm A')}`}
              </h2>
            )}
            {slug && slug === 'create' && (
              <video
                playsInline={true}
                className="live-video-view"
                ref={videoRef}
                height={'100%'}
                width={'100%'}
                autoPlay
                muted
              />
            )}
            {!streamStarted && slug && slug === 'create' && (
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
          </div>
          {slug && slug === 'create' && (
            <button
              onClick={() => router.push('/live')}
              style={{ marginTop: 12 }}
            >
              Stop Live
            </button>
          )}

          <h3>{pageData?.stream?.name}</h3>
          <span>{pageData?.stream?.name}</span>
        </div>

        <div className="col-md-4">
          {/* {pageData?.stream?.status === 'live' && (
            <ChatRoomBox
              streamData={pageData.stream}
              messages={messages}
              handleClose={() => {}}
              socket={socket}
            />
          )} */}
        </div>
      </div>
    </React.Fragment>
  );
};
