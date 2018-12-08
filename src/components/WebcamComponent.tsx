import { CircularProgress, Fab } from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { CameraFront, CameraRear, PhotoCamera } from '@material-ui/icons';
import { canvasToBlob, createObjectURL } from 'blob-util';
import * as React from 'react';
import { createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import * as Webcam from 'react-webcam';
import { Dispatch } from 'redux';
import { FACINGMODE_REAR, FACINGMODE_FRONT } from '../constants';
import {
  showMessage,
  switchFacingMode,
  addImages,
  loadedWebcam,
  screenshotVideo,
} from '../actions/FaceOffActions';
import { MAX_WIDTH, MAX_HEIGHT } from '../constants';
import { FaceOffModel } from '../models';
import { RootState } from '../reducers';

// declare namespace Webcam {
//   interface WebcamProps {
//     videoConstraints: any;
//   }
// }

/*
prop	type	default	notes
className	string	''	CSS class of video element
audio	boolean	true	enable/disable audio
height	number	480	height of video element
width	number	640	width of video element
screenshotWidth	number		width of screenshot
style	object		style prop passed to video element
screenshotFormat	string	'image/webp'	format of screenshot
onUserMedia	function	noop	callback for when component receives a media stream
onUserMediaError	function	noop	callback for when component can't receive a media stream with MediaStreamError param
screenshotQuality	number	0.92	quality of screenshot(0 to 1)
audioConstraints	object		MediaStreamConstraint(s) for the audio
videoConstraints	object		MediaStreamConstraints(s) for the video
*/

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
    loading: {
      position: 'absolute',
      marginTop: '-6px',
      marginLeft: '-6px',
    },
    rearFacing: {
      margin: spacing.unit,
      position: 'absolute',
      left: '0px',
      zIndex: 1,
    },
    frontFacing: {
      margin: spacing.unit,
      position: 'absolute',
      left: '60px',
      zIndex: 1,
    },
    screenshot: {
      margin: spacing.unit,
      position: 'absolute',
      left: '120px',
      zIndex: 1,
    },
  });

const faceOffPanelSelector = ({
  facingMode,
  isWebcamLoaded,
  webcamRef,
  webcamOverlayRef,
  videoCtx,
}: FaceOffModel) => ({
  facingMode,
  isWebcamLoaded,
  webcamRef,
  webcamOverlayRef,
  videoCtx,
});

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMessage: (message: string) => dispatch(showMessage(message)),
  addImages: (images: HTMLImageElement[]) => dispatch(addImages(images)),
  switchFacingMode: (facingMode: string) =>
    dispatch(switchFacingMode(facingMode)),
  loadedWebcam: () => dispatch(loadedWebcam()),
  screenshotVideo: () => dispatch(screenshotVideo()),
});

const WebcamComponent = ({
  classes,
  isWebcamLoaded,
  webcamRef,
  webcamOverlayRef,
  facingMode,
  videoCtx,
  showMessage,
  switchFacingMode,
  addImages,
  loadedWebcam,
}: StyledComponentProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>) => {
  const onPlayHandler = () => {
    if (webcamRef.current && (webcamRef.current as any).video) {
      const video: HTMLVideoElement = (webcamRef.current as any).video;
      const { videoWidth, videoHeight } = video;
      videoCtx.canvas.width = videoWidth;
      videoCtx.canvas.height = videoHeight;
      videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
    }
  };
  const userMediaHandler = () => {
    if (webcamRef.current && (webcamRef.current as any).video) {
      (webcamRef.current as any).video.onPlay = onPlayHandler;
    }
    loadedWebcam();
  };
  const switchRear = () => switchFacingMode(FACINGMODE_REAR);
  const switchFront = () => switchFacingMode(FACINGMODE_FRONT);
  return (
    <div className={classes!.container}>
      <div className={classes!.rearFacing}>
        {!isWebcamLoaded && (
          <CircularProgress className={classes!.loading} size={68} />
        )}
        <Fab color="primary" aria-label="Use rear camera" onClick={switchRear}>
          <CameraRear />
        </Fab>
      </div>
      <div className={classes!.frontFacing}>
        {!isWebcamLoaded && (
          <CircularProgress className={classes!.loading} size={68} />
        )}
        <Fab
          color="primary"
          aria-label="Use front camera"
          onClick={switchFront}
        >
          <CameraFront />
        </Fab>
      </div>
      <div className={classes!.screenshot}>
        {!!isWebcamLoaded && (
          <Fab
            color="primary"
            aria-label="Take screenshot"
            onClick={screenshotVideo}
          >
            <PhotoCamera />
          </Fab>
        )}
      </div>
      <canvas
        className={classes!.overlay}
        width={MAX_WIDTH}
        height={MAX_HEIGHT}
        ref={webcamOverlayRef}
      />
      <Webcam
        ref={webcamRef}
        audio={false}
        width={MAX_WIDTH}
        height={MAX_HEIGHT}
        screenshotFormat="image/png"
        onUserMedia={userMediaHandler}
        style={{
          borderWidth: 5,
          borderStyle: 'solid',
          borderColor: '#ccc',
        }}
        {...{ videoConstraints: { facingMode } }}
      />
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WebcamComponent));
