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
                <ReactPlayer
                  height={'100%'}
                  width={'100vw'}
                  style={{ objectFit: 'cover' }}
                  url={recordingUrl}
                  playing
                  controls={true}
                />
              </div>
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
              <div />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
