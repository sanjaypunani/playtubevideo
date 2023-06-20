// import flv from 'flv.js';

import axios from 'axios';
import { useState } from 'react';

export const CreateStreamPopup = ({ handleClose, open, data }) => {
  const [streamData, setStreamData] = useState();
  const [streamId, setStreamId] = useState(
    Math.floor(Math.random() * 100000000000),
  );

  const watchUrl = `${window.location.origin}/live?watch=${streamId}`;

  const handleChangeStreamData = (key, value) => {
    setStreamData({ ...streamData, [key]: value });
  };

  const checkValidation = () => {
    let valid = true;
    if (!streamData?.name || streamData?.name === '') {
      valid = false;
      alert('Please enter name');
    } else if (!streamData?.description || streamData?.description === '') {
      valid = false;
      alert('Please enter description');
    } else if (!streamData?.image) {
      alert('Please select image');
    } else {
      valid = true;
    }
    return valid;
  };

  const onCreateStream = () => {
    if (checkValidation()) {
      const formData = new FormData();
      const streamUrl = `/live/${streamId}`;
      formData.append('image', streamData?.image);
      formData.append('name', streamData?.name);
      formData.append('description', streamData?.description);
      formData.append('stream_id', streamId);
      formData.append('stream_url', streamUrl);

      axios
        .post('/api/lives', formData)
        .then(res => {
          const data = {
            ...streamData,
            stream_id: streamId,
            stream_url: streamUrl,
          };
          handleClose({ isSuccess: true, streamData: data });
          console.log('success', data);
        })
        .catch(error => {
          console.log('error:', error);
        });
    }
  };
  return (
    <div className={`modal fade ${open ? 'show' : ''}`} id="createstreampopup">
      <div className="modal-dialog modal-md modal-dialog-centered popupDesign">
        <div className="modal-content">
          <div className="create-stream-dialog-main">
            <h3>Create Stream</h3>
            <div style={{ height: 22 }} />
            <input
              onChange={e => handleChangeStreamData('name', e.target.value)}
              value={streamData?.name}
              className="custom-input"
              placeholder="Stream Name"
            />
            <div style={{ height: 12 }} />
            <input
              onChange={e =>
                handleChangeStreamData('description', e.target.value)
              }
              value={streamData?.description}
              className="multiline-input"
              placeholder="Stream Descpriction"
              multiple
            />
            <div style={{ height: 12 }} />
            <div className="image-upload-row">
              <input
                multiple={false}
                onChange={e => {
                  console.log('e.target.files', e.target.files);
                  handleChangeStreamData('image', e.target.files[0]);
                }}
                type="file"
              />
              <div className="preview-image">
                {streamData?.image && (
                  <img
                    alt="previewimage"
                    className="image-main"
                    src={URL.createObjectURL(streamData?.image)}
                  />
                )}
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
            <button
              type="button"
              data-dismiss="modal"
              data-toggle="modal"
              data-target="#golivepopup"
              onClick={() => onCreateStream()}
            >
              Go Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
