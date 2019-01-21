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
import * as React from 'react';
import { ChangeEvent, Fragment, KeyboardEvent } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector } from 'reselect';
import {
  changeVideoUrl,
  fetchMp4Url,
  loadedVideo,
  screenshotVideo,
} from '../actions/FaceOffActions';
import {
  CORS_PROXY_URL,
  FACINGMODE_FRONT,
  FACINGMODE_REAR,
} from '../constants';
import { MAX_HEIGHT, MAX_WIDTH } from '../constants';
import { IFaceOffModel, IRootState } from '../models';

const styles = ({ spacing }: Theme) =>
  createStyles({
    container: {
      position: 'relative',
    },
    frontFacing: {
      left: '120px',
      margin: spacing.unit,
      position: 'absolute',
      zIndex: 1,
    },
    overlay: {
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 1,
    },
    progress: {
      margin: spacing.unit * 2,
    },
    rearFacing: {
      left: '60px',
      margin: spacing.unit,
      position: 'absolute',
      zIndex: 1,
    },
    screenshot: {
      left: '0px',
      margin: spacing.unit,
      position: 'absolute',
      zIndex: 1,
    },
    textField: {
      marginLeft: spacing.unit,
      marginRight: spacing.unit,
      width: MAX_WIDTH + 'px',
    },
  });

const faceOffPanelSelector = ({
  videoRef,
  videoOverlayRef,
  videoUrl,
  videoUrlLoaded,
  mp4Url,
  tab,
}: IFaceOffModel) => ({
  mp4Url,
  tab,
  videoOverlayRef,
  videoRef,
  videoUrl,
  videoUrlLoaded,
});

const componentSelector = createSelector(faceOffPanelSelector, props => ({
  ...props,
  videoUrlTrimmed: (props.videoUrl || '').replace(/^\s+|\s+$/g, ''),
}));

const mapStateToProps = ({ faceOffPanel }: IRootState) =>
  componentSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchingMp4Url: (videoUrl: string) => dispatch(fetchMp4Url(videoUrl)),
  loadedTheVideo  : () => dispatch(loadedVideo()),
  screenshotingVideo: (video: HTMLVideoElement) =>
    dispatch(screenshotVideo(video)),
  textFieldHandler: ({ target }: ChangeEvent<HTMLInputElement>) =>
    dispatch(changeVideoUrl(target!.value)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { fetchingMp4Url, screenshotingVideo } = dispatchProps;
  const { videoRef, videoUrl } = stateProps;
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    keyDownHandler: (ev: KeyboardEvent<HTMLElement>) => {
      switch (ev.charCode) {
        case 13:
          fetchingMp4Url(videoUrl);
          break;
      }
    },
    loadMp4Handler: () => fetchingMp4Url(videoUrl),
    screenshotHandler: () => screenshotingVideo(videoRef.current),
  };
};

const VideoComponent = ({
  classes,
  keyDownHandler,
  loadedTheVideo,
  loadMp4Handler,
  mp4Url,
  screenshotHandler,
  tab,
  textFieldHandler,
  videoRef,
  videoOverlayRef,
  videoUrl,
  videoUrlTrimmed,
  videoUrlLoaded,
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
          onKeyPress: keyDownHandler,
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
            borderColor: '#ccc',
            borderStyle: 'solid',
            borderWidth: 5,
          }}
          crossOrigin="anonymous"
          onCanPlay={loadedTheVideo}
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
