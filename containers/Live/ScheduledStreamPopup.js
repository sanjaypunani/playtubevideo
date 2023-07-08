// import flv from 'flv.js';

import axios from 'axios';
import moment from 'moment';
import { useMemo } from 'react';

export const ScheduledStreamPopup = ({ handleClose, open, data }) => {
  const watchUrl = useMemo(() => {
    return `${window.location.origin}/live?watch=${data?.stream_id}`;
  }, [data]);

  const onGoLive = () => {
    handleClose({ isSuccess: true, streamData: data });
    // axios
    //   .put(`/api/lives/${data?.stream_id}`, { status: 'live' })
    //   .then(res => {
    //     handleClose({ isSuccess: true, streamData: data });
    //   })
    //   .catch(error => {
    //     console.log('error:', error);
    //   });
  };

  return (
    <div
      className={`modal fade ${open ? 'show' : ''}`}
      id="scheduledstreampopup"
    >
      <div className="modal-dialog modal-md modal-dialog-centered popupDesign">
        <div className="modal-content">
          <div className="create-stream-dialog-main">
            <h3>My Scheduled Stream</h3>
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <span style={{ display: 'flex' }}>{data?.name}</span>
                  <span style={{ display: 'flex', fontSize: 14, marginTop: 4 }}>
                    {data?.description}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      color: 'gray',
                      fontSize: 14,
                      marginTop: 6,
                    }}
                  >{`Schedule At ${moment(data?.schedule_date_time).format(
                    'DD/MM/YYYY hh:mm A',
                  )}`}</span>
                </div>
                <div className="col-md-6">
                  <img
                    src={`${window.location.origin}${data?.poster}`}
                    alt="streamposter"
                    className="stream-image-card"
                  />
                </div>
              </div>
            </div>
            <div style={{ height: 32 }} />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{watchUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(watchUrl);
                }}
                style={{ marginLeft: 12 }}
              >
                Copy
              </button>
            </div>
            <div style={{ height: 32 }} />
            <div className="container">
              <div className="row">
                <div
                  style={{ display: 'flex', justifyContent: 'center' }}
                  className="col-md-12"
                >
                  <button
                    type="button"
                    data-dismiss="modal"
                    data-toggle="modal"
                    data-target="#golivepopup"
                    onClick={() => onGoLive('live')}
                  >
                    Go Live Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
