import {
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField
} from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { CameraFront, CameraRear, PhotoCamera } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { FACINGMODE_REAR, FACINGMODE_FRONT } from '../constants';
import {
  showMessage,
  changeYoutubeUrl,
  addImages
} from '../actions/cameraPanelActions';
import { AppState } from '../reducers';

const WIDTH = 640;
const HEIGHT = 480;

const styles = ({ spacing }: Theme) =>
  createStyles({
    container: {
      position: 'relative'
    },
    progress: {
      margin: spacing.unit * 2
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
    },
    textField: {
      width: WIDTH + 'px',
      marginLeft: spacing.unit,
      marginRight: spacing.unit
    }
  });

const videoRef = React.createRef<HTMLVideoElement>();

const readAsDataURL = async () => {
  let { videoWidth, videoHeight } = videoRef.current;
  if (videoWidth > WIDTH) {
    videoHeight = ~~((WIDTH * videoHeight) / videoWidth);
    videoWidth = WIDTH;
  }
  const canvas = document.createElement('canvas');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
  return ctx.canvas.toDataURL();
};

const screenshotHandler = async (addImagesFunc: typeof addImages) => {
  addImagesFunc([
    {
      name: `Video-${new Date()
        .toLocaleString('en-GB')
        .replace('/', '-')
        .replace(/[,]/g, '')}.jpg`,
      width: WIDTH,
      height: HEIGHT,
      preview: await readAsDataURL()
    }
  ]);
};

const YoutubeComponent = ({
  classes,
  youtubeUrl,
  mp4Url,
  showMessage,
  changeYoutubeUrl,
  addImages
}) => (
  <div className={classes.container}>
    <div>
      <TextField
        label="Youtube Url"
        className={classes.textField}
        value={youtubeUrl}
        onChange={({ target }) => changeYoutubeUrl(target.value)}
        margin="normal"
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Take screenshot"
                onClick={() => screenshotHandler(addImages)}
              >
                <PhotoCamera />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </div>
    {!mp4Url ? (
      <CircularProgress className={classes.progress} />
    ) : (
      <video
        ref={videoRef}
        width={WIDTH}
        height={HEIGHT}
        controls
        autoPlay
        loop
        muted
        style={{
          borderWidth: 5,
          borderStyle: 'solid',
          borderColor: '#ccc'
        }}
        crossOrigin="anonymous"
      >
        <source
          src={`https://cors-anywhere.herokuapp.com/${mp4Url}`}
          type="video/mp4"
        />
      </video>
    )}
  </div>
);

const cameraPanelSelector = ({ youtubeUrl, mp4Url }) => ({
  youtubeUrl,
  mp4Url
});

const mapStateToProps = ({ cameraPanel }: AppState) =>
  cameraPanelSelector(cameraPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMessage: message => dispatch(showMessage(message)),
  addImages: images => dispatch(addImages(images)),
  changeYoutubeUrl: youtubeUrl => dispatch(changeYoutubeUrl(youtubeUrl))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(YoutubeComponent));
