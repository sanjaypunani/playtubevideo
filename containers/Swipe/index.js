import React, { useEffect, useMemo, useState } from 'react';
import Form from '../../components/DynamicForm/Index';
import { useDispatch } from 'react-redux';
import playlist from '../../store/actions/general';
import axios from 'axios';
import Router from 'next/router';

export const SwipeMainPage = props => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(playlist.setMenuOpen(true));
  }, []);

  const [videoSuggections, setVideoSuggections] = useState();
  const [swipeToVideo, setSwipeToVideo] = useState();
  const [submiting, setSubmiting] = useState(false);

  const defaultValues = {};

  const fetchVideoSuggections = value => {
    const formData = new FormData();
    formData.append('page', 1);
    formData.append('limit', 21);
    axios
      .post(
        `${window.location.origin}/api/search/video?h=${value}&sort=view`,
        formData,
      )
      .then(response => {
        const suggections = response?.data?.videos
          ?.filter(
            item => item?.custom_url !== props?.pageData?.video?.custom_url,
          )
          ?.map(item => {
            return {
              title: item?.title,
              image: item?.orgImage,
              id: item?.video_id,
              video: item,
            };
          });
        setVideoSuggections(suggections);
      });
  };

  const onChangeParentVideo = data => {
    let videoData = videoSuggections?.find(item => item?.id === data?.id);
    setSwipeToVideo(videoData.video);
  };

  const formFields = useMemo(() => {
    return [
      {
        key: 'swipe_to',
        type: 'autosuggest',
        id: 'swipe_to',
        unclear: true,
        suggestionFromPropsOnly: true,
        fetchRequest: fetchVideoSuggections,
        // onChangeFunction: this.onChangeParentVideo,
        onSelectVideo: onChangeParentVideo,
        placeholder: 'Search for a target Video...',
        suggestionValue: videoSuggections,
        label: 'Swipe to',
      },
    ];
  }, [videoSuggections]);

  const onSwipeVideo = () => {
    if (swipeToVideo) {
      setSubmiting(true);
      axios
        .get(
          `${window.location.origin}/api/video/swipeto/?from=${props?.pageData?.video?.custom_url}&swipe_slug=${swipeToVideo?.custom_url}`,
        )
        .then(response => {
          setSubmiting(false);
          Router.push('/video-admin/videos');
        });
    }
  };

  return (
    <div className="details-video-wrap">
      <div className="container">
        <div className="row">
          <React.Fragment>
            <div className="col-xl-9 col-lg-8">
              <div className="titleWrap">
                <span className="title">
                  <React.Fragment>
                    <span className="recent_video">
                      <span className="material-icons">video_library</span>
                    </span>
                    Swipe Video
                  </React.Fragment>
                </span>
              </div>
              <Form
                className="form"
                defaultValues={defaultValues}
                {...props}
                // generalError={this.state.error}
                validators={[]}
                submitText={submiting ? 'Submiting...' : 'Submit'}
                model={formFields}
                onSubmit={model => {
                  onSwipeVideo();
                  // this.onSubmit(model);
                }}
              />
            </div>
          </React.Fragment>
        </div>
      </div>
    </div>
  );
};
