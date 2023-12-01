'use client';
import React, { useEffect, useMemo, useState } from 'react';
import './livestream.css';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import { ChatRoomBox } from './ChatRoomBox';

export const GoWatchLive = ({ socket, pageData }) => {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [playingUrl, setPlayingUrl] = useState();

  useEffect(() => {
    if (pageData?.stream) {
      if (pageData?.stream?.status === 'live') {
        let liveHost = '';
        if (window.location.protocol === 'http') {
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

  return (
    <React.Fragment>
      <div style={{ padding: 12 }} className="row">
        <div className="col col-md-8">
          <div className="live-warper">
            {playingUrl && (
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
          </div>
          <h3>Here will be video title</h3>
          <span>Here will be video details</span>
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
