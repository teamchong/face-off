import { CircularProgress, Fab } from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { CameraFront, CameraRear, PhotoCamera } from '@material-ui/icons';
import { canvasToBlob } from 'blob-util';
import * as React from 'react';
import { createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import * as Webcam from 'react-webcam';
import { Dispatch } from 'redux';
import {
  addImages,
  loadedWebcam,
  screenshotVideo,
  showMessage,
  switchFacingMode,
} from '../actions/FaceOffActions';
import { FACINGMODE_FRONT, FACINGMODE_REAR, MAX_HEIGHT, MAX_WIDTH } from '../constants';
import { IFaceOffModel, IRootState } from '../models';

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
    frontFacing: {
      margin: spacing.unit,
      position: 'absolute',
      top: '60px',
      zIndex: 2,
    },
    loading: {
      marginLeft: '-6px',
      marginTop: '-6px',
      position: 'absolute',
    },
    overlay: {
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 1,
    },
    rearFacing: {
      margin: spacing.unit,
      position: 'absolute',
      top: '0px',
      zIndex: 2,
    },
    screenshot: {
      margin: spacing.unit,
      position: 'absolute',
      top: '120px',
      zIndex: 2,
    },
  });

const faceOffPanelSelector = ({
  facingMode,
  isWebcamLoaded,
  webcamRef,
  webcamOverlayRef,
  tab,
}: IFaceOffModel) => ({
  facingMode,
  isWebcamLoaded,
  tab,
  webcamOverlayRef,
  webcamRef,
});

const mapStateToProps = ({ faceOffPanel }: IRootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addImages: (images: HTMLImageElement[]) => dispatch(addImages(images)),
  loadedTheWebcam: () => dispatch(loadedWebcam()),
  screenshotingVideo: (video: HTMLVideoElement) =>
    dispatch(screenshotVideo(video)),
  showMessage: (message: string) => dispatch(showMessage(message)),
  switchFront: () => dispatch(switchFacingMode(FACINGMODE_FRONT)),
  switchRear: () => dispatch(switchFacingMode(FACINGMODE_REAR)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { screenshotingVideo } = dispatchProps;
  const { webcamRef } = stateProps;
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    screenshotHandler: () =>
      screenshotingVideo(
        webcamRef.current ? (webcamRef.current as any).video : null
      ),
  };
};

const WebcamComponent = ({
  classes,
  facingMode,
  isWebcamLoaded,
  loadedTheWebcam,
  screenshotHandler,
  switchRear,
  switchFront,
  webcamRef,
  webcamOverlayRef,
}: StyledComponentProps & ReturnType<typeof mergeProps>) => (
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
      <Fab color="primary" aria-label="Use front camera" onClick={switchFront}>
        <CameraFront />
      </Fab>
    </div>
    <div className={classes!.screenshot}>
      {!!isWebcamLoaded && (
        <Fab
          color="primary"
          aria-label="Take screenshot"
          onClick={screenshotHandler}
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
      onUserMedia={loadedTheWebcam}
      style={{
        borderColor: '#ccc',
        borderStyle: 'solid',
        borderWidth: 5,
      }}
      {...{ videoConstraints: { facingMode } }}
    />
  </div>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withStyles(styles)(WebcamComponent));
