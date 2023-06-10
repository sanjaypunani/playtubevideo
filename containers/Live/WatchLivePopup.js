import { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import Router from 'next/router';

// import flv from 'flv.js';

export const WatchLivePopup = ({ handleClose, open, data }) => {
  const streamUrl =
    window.location.protocol +
    // 'https:' +
    '//' +
    window.location.hostname +
    // '103.117.156.182' +
    ':8443' +
    data?.stream_url +
    '.flv';

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
              <button
                type="button"
                data-dismiss="modal"
                onClick={() => {
                  handleClose();
                }}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
