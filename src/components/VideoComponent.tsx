import {
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import {
  CameraFront,
  CameraRear,
  PhotoCamera,
  PlayCircleFilled,
} from '@material-ui/icons';
import { createObjectURL } from 'blob-util';
import * as React from 'react';
import { createRef, ChangeEvent, Fragment, KeyboardEvent } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector } from 'reselect';
import {
  CORS_PROXY_URL,
  FACINGMODE_REAR,
  FACINGMODE_FRONT,
} from '../constants';
import {
  changeVideoUrl,
  fetchMp4Url,
  loadedVideo,
  screenshotVideo,
} from '../actions/FaceOffActions';
import { MAX_WIDTH, MAX_HEIGHT } from '../constants';
import { FaceOffModel, RootState } from '../models';

const styles = ({ spacing }: Theme) =>
  createStyles({
    container: {
      position: 'relative',
    },
    overlay: {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1,
    },
    progress: {
      margin: spacing.unit * 2,
    },
    screenshot: {
      margin: spacing.unit,
      position: 'absolute',
      left: '0px',
      zIndex: 1,
    },
    rearFacing: {
      margin: spacing.unit,
      position: 'absolute',
      left: '60px',
      zIndex: 1,
    },
    frontFacing: {
      margin: spacing.unit,
      position: 'absolute',
      left: '120px',
      zIndex: 1,
    },
    textField: {
      width: MAX_WIDTH + 'px',
      marginLeft: spacing.unit,
      marginRight: spacing.unit,
    },
  });

const faceOffPanelSelector = ({
  videoRef,
  videoOverlayRef,
  videoUrl,
  videoUrlLoaded,
  mp4Url,
  tab,
}: FaceOffModel) => ({
  videoRef,
  videoOverlayRef,
  videoUrl,
  videoUrlLoaded,
  mp4Url,
  tab,
});

const componentSelector = createSelector(faceOffPanelSelector, props => ({
  ...props,
  videoUrlTrimmed: (props.videoUrl || '').replace(/^\s+|\s+$/g, ''),
}));

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  componentSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  textFieldHandler: ({ target }: ChangeEvent<HTMLInputElement>) =>
    dispatch(changeVideoUrl(target!.value)),
  fetchMp4Url: (videoUrl: string) => dispatch(fetchMp4Url(videoUrl)),
  loadedVideo: () => dispatch(loadedVideo()),
  screenshotVideo: (video: HTMLVideoElement) =>
    dispatch(screenshotVideo(video)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { fetchMp4Url, screenshotVideo } = dispatchProps;
  const { videoRef, videoUrl } = stateProps;
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    loadMp4Handler: () => fetchMp4Url(videoUrl),
    screenshotHandler: () => screenshotVideo(videoRef.current),
    keyDownHandler: (ev: KeyboardEvent<HTMLElement>) => {
      switch (ev.charCode) {
        case 13:
          fetchMp4Url(videoUrl);
          break;
      }
    },
  };
};

const VideoComponent = ({
  classes,
  videoRef,
  videoOverlayRef,
  videoUrl,
  videoUrlTrimmed,
  videoUrlLoaded,
  mp4Url,
  tab,
  textFieldHandler,
  loadedVideo,
  loadMp4Handler,
  screenshotHandler,
  keyDownHandler,
}: StyledComponentProps & ReturnType<typeof mergeProps>) => (
  <div className={classes!.container}>
    <div>
      <TextField
        label="Video Url"
        className={classes!.textField}
        value={videoUrl}
        onChange={textFieldHandler}
        margin="normal"
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          onKeyPress: keyDownHandler,
          endAdornment: (
            <InputAdornment position="end">
              {!!mp4Url && (
                <IconButton
                  aria-label="Take screenshot"
                  onClick={screenshotHandler}
                >
                  <PhotoCamera />
                </IconButton>
              )}
              {!!videoUrlTrimmed && videoUrlTrimmed !== videoUrlLoaded && (
                <IconButton
                  aria-label="Take screenshot"
                  onClick={loadMp4Handler}
                >
                  <PlayCircleFilled />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
    </div>
    {!!mp4Url ? (
      <Fragment>
        <canvas
          className={classes!.overlay}
          width={MAX_WIDTH}
          height={MAX_HEIGHT}
          ref={videoOverlayRef}
        />
        <video
          ref={videoRef}
          width={MAX_WIDTH}
          height={MAX_HEIGHT}
          controls={true}
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
          style={{
            borderWidth: 5,
            borderStyle: 'solid',
            borderColor: '#ccc',
          }}
          crossOrigin="anonymous"
          onCanPlay={loadedVideo}
        >
          <source
            src={`${/^http/i.test(mp4Url) ? CORS_PROXY_URL : ''}${mp4Url}`}
          />
        </video>
      </Fragment>
    ) : (
      !!videoUrlTrimmed && <CircularProgress className={classes!.progress} />
    )}
  </div>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withStyles(styles)(VideoComponent));
