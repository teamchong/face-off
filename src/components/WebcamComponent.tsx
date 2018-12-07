import { CircularProgress, Fab } from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { CameraFront, CameraRear, PhotoCamera } from '@material-ui/icons';
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
  enabledCamera,
} from '../actions/cameraPanelActions';
import { CameraPanelModel } from '../models';
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

const WIDTH = 640;
const HEIGHT = 480;

const styles = ({ spacing }: Theme) =>
  createStyles({
    container: {
      position: 'relative',
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

const cameraRef = createRef<Webcam>();

type Actions = {
  showMessage: typeof showMessage;
  switchFacingMode: typeof switchFacingMode;
  addImages: typeof addImages;
};
type WebcamComponentProps = StyledComponentProps &
  Actions &
  Partial<CameraPanelModel>;
const WebcamComponent = ({
  classes,
  isCameraEnabled,
  facingMode,
  showMessage,
  switchFacingMode,
  addImages,
  enabledCamera,
}: WebcamComponentProps) => {
  const screenshotHandler = async () => {
    if (cameraRef.current) {
      addImages([
        await new Promise<HTMLImageElement>((resolve, reject) => {
          const imgEl = new Image();
          imgEl.title = `WebCam-${new Date()
            .toLocaleString('en-GB')
            .replace('/', '-')
            .replace(/[,]/g, '')}.jpg`;
          imgEl.onload = () => resolve(imgEl);
          imgEl.onerror = error => reject(error);
          imgEl.src = cameraRef.current.getScreenshot() || '';
        }),
      ]);
    }
  };
  const userMediaHandler = () => enabledCamera();
  const switchRear = () => switchFacingMode(FACINGMODE_REAR);
  const switchFront = () => switchFacingMode(FACINGMODE_FRONT);
  return (
    <div className={classes!.container}>
      <div className={classes!.rearFacing}>
        {!isCameraEnabled && (
          <CircularProgress className={classes!.loading} size={68} />
        )}
        <Fab color="primary" aria-label="Use rear camera" onClick={switchRear}>
          <CameraRear />
        </Fab>
      </div>
      <div className={classes!.frontFacing}>
        {!isCameraEnabled && (
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
        {!!isCameraEnabled && (
          <Fab
            color="primary"
            aria-label="Take screenshot"
            onClick={screenshotHandler}
          >
            <PhotoCamera />
          </Fab>
        )}
      </div>
      <Webcam
        ref={cameraRef}
        width={WIDTH}
        height={HEIGHT}
        videoConstraints={{ facingMode }}
        audio={false}
        screenshotFormat="image/jpeg"
        onUserMedia={userMediaHandler}
        style={{
          borderWidth: 5,
          borderStyle: 'solid',
          borderColor: '#ccc',
        }}
      />
    </div>
  );
};

const cameraPanelSelector = ({
  facingMode,
  isCameraEnabled,
}: CameraPanelModel) => ({
  facingMode,
  isCameraEnabled,
});

const mapStateToProps = ({ cameraPanel }: RootState) =>
  cameraPanelSelector(cameraPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMessage: (message: string) => dispatch(showMessage(message)),
  addImages: (images: HTMLImageElement[]) => dispatch(addImages(images)),
  switchFacingMode: (facingMode: string) =>
    dispatch(switchFacingMode(facingMode)),
  enabledCamera: () => dispatch(enabledCamera()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WebcamComponent));
