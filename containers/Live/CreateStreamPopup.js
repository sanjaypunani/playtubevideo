// import flv from 'flv.js';

import axios from 'axios';
import moment from 'moment';
import { useRouter } from 'next/router';
import { schedule } from 'node-cron';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

export const CreateStreamPopup = ({ handleClose, open, subDomainCategory }) => {
  const router = useRouter();
  const { pageInfoData } = useSelector(state => state.general);
  const categories = pageInfoData?.categories;
  const [randomNumber, setRandomNumber] = useState(
    Math.floor(Math.random() * 100000000000),
  );
  const [streamData, setStreamData] = useState({
    category: subDomainCategory || categories[0],
    stream_date: moment(new Date()).format('YYYY-MM-DD'),
    stream_time: moment(new Date()).format('HH:mm'),
  });
  const [loading, setLoading] = useState(false);
  const [streamId, setStreamId] = useState(
    `${streamData?.category?.title}_live_${randomNumber}`,
  );

  useEffect(() => {
    setStreamId(`${streamData?.category?.title}_live_${randomNumber}`);
  }, [randomNumber, streamData?.category]);

  useEffect(() => {
    setRandomNumber(Math.floor(Math.random() * 100000000000));
  }, [open]);

  const watchUrl = useMemo(() => {
    return `${window.location.origin}/live/join?stream_id=${streamId}`;
  }, [streamId]);

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

  const onCreateStream = status => {
    if (checkValidation()) {
      setLoading(true);
      const formData = new FormData();

      const streamUrl = `/live/${streamId}`;
      formData.append('image', streamData?.image);
      formData.append('name', streamData?.name);
      formData.append('description', streamData?.description);
      formData.append('stream_id', streamId);
      formData.append('stream_url', streamUrl);
      formData.append('category', streamData?.category?.category_id);
      formData.append('status', 'schedule');
      formData.append(
        'schedule_date_time',
        moment(
          new Date(`${streamData?.stream_date} ${streamData?.stream_time}`),
        )._d,
      );

      axios
        .post('/api/lives', formData)
        .then(res => {
          setLoading(false);
          setRandomNumber(Math.floor(Math.random() * 100000000000));
          if (status === 'live') {
            router.push(`/live/create?stream_id=${streamId}`);
            // handleClose({ isSuccess: true, streamData: data });
          } else {
            router.push(`/live`);
            handleClose();
          }
        })
        .catch(error => {
          setLoading(false);
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
            <div class="dropdown">
              <button
                class="btn btn-secondary dropdown-toggle category-drop-button"
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                disabled={Boolean(subDomainCategory)}
              >
                {streamData?.category?.title}
              </button>
              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                {categories?.map(item => {
                  return (
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleChangeStreamData('category', item)}
                      class="dropdown-item"
                    >
                      {item?.title}
                    </div>
                  );
                })}
              </div>
            </div>
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

            <div className="container dateTimeContainer">
              <div className="row">
                <div className="col-md-6 dateTimeItem">
                  <span>Schedule Date</span>
                  <input
                    onChange={e => {
                      handleChangeStreamData('stream_date', e.target.value);
                    }}
                    value={streamData?.stream_date}
                    className="dateTimeInput"
                    type="date"
                  />
                </div>
                <div className="col-md-6 dateTimeItem">
                  <span>Schedule Time</span>
                  <input
                    onChange={e => {
                      handleChangeStreamData('stream_time', e.target.value);
                    }}
                    value={streamData?.stream_time}
                    className="dateTimeInput"
                    type="time"
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
                  className="col-md-6"
                >
                  <button
                    type="button"
                    className="outlineButton"
                    data-dismiss="modal"
                    data-toggle="modal"
                    data-target="#golivepopup"
                    onClick={() => onCreateStream('schedule')}
                  >
                    {loading ? 'Loading...' : 'Schedule Stream'}
                  </button>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'center' }}
                  className="col-md-6"
                >
                  <button
                    type="button"
                    // data-dismiss="modal"
                    // data-toggle="modal"
                    // data-target="#golivepopup"
                    onClick={() => onCreateStream('live')}
                  >
                    {loading ? 'Loading...' : 'Go Live Now'}
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
