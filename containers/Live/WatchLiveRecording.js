import ReactPlayer from 'react-player';

export const WatchLiveRecording = ({ handleClose, open, data }) => {
  const recordingUrl = `${window?.location?.origin}${data?.recording}`;

  return (
    <div
      className={`modal fade ${open ? 'show' : ''}`}
      id="watchrecordingepopup"
    >
      <div className="modal-dialog modal-md modal-dialog-centered modal-xl popupDesign full-screen-dialog">
        <div className="modal-content">
          <div className="main-view-live">
            <div className="camera-view">
              <div style={{ height: '100%', marginBottom: 132 }}>
                {/* <ReactPlayer
                  height={'100%'}
                  width={'100vw'}
                  style={{ objectFit: 'cover' }}
                  url={recordingUrl}
                  playing
                  playsinline={true}
                  controls={true}
                /> */}
                <iframe
                  // style={{width: '100%', border: 'none', height: '100%'}}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    border: 'none',
                  }}
                  src={`https://storage1.inqtube.com/gnxPlayer/public/gplr2.html?path=${recordingUrl}&autoplay=true`}
                  allowFullScreen=""
                  playsInline
                  allow="autoplay; fullscreen; picture-in-picture; xr-spatial-tracking; encrypted-media"
                />
              </div>
            </div>

            <div className="footer-view">
              <i
                style={{ color: 'gray', fontSize: 36, cursor: 'pointer' }}
                class="fa fa-window-close"
                aria-hidden="true"
                onClick={() => {
                  handleClose();
                }}
              ></i>
              <div />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
