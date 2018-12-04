import { Fab } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { CameraFront, CameraRear, PhotoCamera } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Webcam from 'react-webcam';
import { Dispatch } from 'redux';
import { FACINGMODE_REAR, FACINGMODE_FRONT } from '../constants';
import {
  showMessage,
  switchFacingMode,
  addImages
} from '../actions/cameraPanelActions';
import { AppState } from '../reducers';
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
      position: 'relative'
    },
    screenshot: {
      margin: spacing.unit,
      position: 'absolute',
      left: '0px',
      zIndex: 1
    },
    rearFacing: {
      margin: spacing.unit,
      position: 'absolute',
      left: '60px',
      zIndex: 1
    },
    frontFacing: {
      margin: spacing.unit,
      position: 'absolute',
      left: '120px',
      zIndex: 1
    }
  });

const cameraRef = React.createRef<Webcam>();

const screenshotHandler = (addImagesFunc: typeof addImages) => {
  addImagesFunc([
    {
      name: `WebCam-${new Date()
        .toLocaleString('en-GB')
        .replace('/', '-')
        .replace(/[,]/g, '')}.jpg`,
      width: WIDTH,
      height: HEIGHT,
      preview: cameraRef.current.getScreenshot()
    }
  ]);
};

const WebcamComponent = ({
  classes,
  facingMode,
  showMessage,
  switchFacingMode,
  addImages
}) => (
  <div className={classes.container}>
    <Fab
      color="primary"
      aria-label="Take screenshot"
      className={classes.screenshot}
      onClick={() => screenshotHandler(addImages)}
    >
      <PhotoCamera />
    </Fab>
    <Fab
      color="primary"
      aria-label="Use rear camera"
      className={classes.rearFacing}
      onClick={() => switchFacingMode(FACINGMODE_REAR)}
    >
      <CameraRear />
    </Fab>
    <Fab
      color="primary"
      aria-label="Use front camera"
      className={classes.frontFacing}
      onClick={() => switchFacingMode(FACINGMODE_FRONT)}
    >
      <CameraFront />
    </Fab>
    <Webcam
      ref={cameraRef}
      width={WIDTH}
      height={HEIGHT}
      videoConstraints={{ facingMode }}
      audio={false}
      screenshotFormat="image/jpeg"
      style={{
        borderWidth: 5,
        borderStyle: 'solid',
        borderColor: '#ccc'
      }}
    />
  </div>
);

const cameraPanelSelector = ({ facingMode }) => ({ facingMode });

const mapStateToProps = ({ cameraPanel }: AppState) =>
  cameraPanelSelector(cameraPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMessage: message => dispatch(showMessage(message)),
  addImages: images => dispatch(addImages(images)),
  switchFacingMode: facingMode => dispatch(switchFacingMode(facingMode))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WebcamComponent));
