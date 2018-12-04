import { Fab } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { CameraFront, CameraRear, PhotoCamera } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
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

const videoRef = React.createRef<HTMLVideoElement>();

const screenshotHandler = (addImagesFunc: typeof addImages) => {
  //   addImagesFunc([
  //     {
  //       name: `Video-${new Date()
  //         .toLocaleString('en-GB')
  //         .replace('/', '-')
  //         .replace(/[,]/g, '')}.jpg`,
  //       width: WIDTH,
  //       height: HEIGHT,
  //       preview: videoRef.current
  //     }
  //   ]);
};

const YoutubeComponent = ({
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
    <video
      ref={videoRef}
      width={WIDTH}
      height={HEIGHT}
      controls
      autoplay
      loop
      muted
      style={{
        borderWidth: 5,
        borderStyle: 'solid',
        borderColor: '#ccc'
      }}
    >
      <source
        src="https:\/\/r4---sn-vgqskned.googlevideo.com\/videoplayback?clen=421372828&expire=1543956755&ipbits=0&pl=16&mime=video%2Fmp4&sparams=clen%2Cdur%2Cei%2Cgir%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Cratebypass%2Crequiressl%2Csource%2Cexpire&itag=18&ms=au%2Crdu&initcwndbps=2785000&mv=m&mt=1543935035&mn=sn-vgqskned%2Csn-vgqs7nl7&mm=31%2C29&ei=s5QGXObiI8XR8wSwrJWQDQ&id=o-AOxzKpLthxADq5E9xIehcz39akVv4-Yg9TdKTlK5W6Js&c=WEB&signature=18F79D17185ADF231BCD0C6C2C5C17680748FE94.94682E3D28D70C4E5DBD457600C73FF181481517&gir=yes&requiressl=yes&ip=54.87.68.138&fvip=2&key=yt6&lmt=1540224087351148&dur=6875.312&source=youtube&ratebypass=yes&txp=5531432"
        type="video/mp4"
      />
    </video>
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
)(withStyles(styles)(YoutubeComponent));
