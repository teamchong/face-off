import {
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField
} from '@material-ui/core';
import { createStyles, StyledComponentProps, withStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { CameraFront, CameraRear, PhotoCamera } from '@material-ui/icons';
import * as React from 'react';
import { createRef, ChangeEvent } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { CORS_PROXY_URL, FACINGMODE_REAR, FACINGMODE_FRONT } from '../constants';
import {
  showMessage,
  changeYoutubeUrl,
  addImages
} from '../actions/cameraPanelActions';
import { CameraPanelModel, ImageModel } from '../models';
import { AppState } from '../reducers';

const WIDTH = 640;
const HEIGHT = 480;

const styles = ({ spacing }: Theme) => createStyles({
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

const videoRef = createRef<HTMLVideoElement>();

const readAsDataURL = async () => {
  let { videoWidth, videoHeight } = videoRef.current as any;
  if (videoWidth > WIDTH) {
    videoHeight = ~~((WIDTH * videoHeight) / videoWidth);
    videoWidth = WIDTH;
  }
  const canvas = document.createElement('canvas');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const ctx = canvas.getContext('2d');
  if (ctx !== null) {
    ctx.drawImage(videoRef.current as any, 0, 0, videoWidth, videoHeight);
    return ctx.canvas.toDataURL();
  }
}

type Actions = {
  showMessage: typeof showMessage;
  changeYoutubeUrl: typeof changeYoutubeUrl;
  addImages: typeof addImages;
};
type YoutubeComponentProps = StyledComponentProps & Actions & Partial<CameraPanelModel>;
const YoutubeComponent = ({
  classes,
  youtubeUrl,
  mp4Url,
  showMessage,
  changeYoutubeUrl,
  addImages
}: YoutubeComponentProps) => {
  const textFieldHandler = ({ target }: ChangeEvent<HTMLInputElement>) => changeYoutubeUrl(target!.value);
  const screenshotHandler = async() => addImages([
    {
      name: `Video-${new Date()
        .toLocaleString('en-GB')
        .replace('/', '-')
        .replace(/[,]/g, '')}.jpg`,
      width: WIDTH,
      height: HEIGHT,
      preview: await readAsDataURL() || ''
    }
  ]);
  return (
    <div className={classes!.container}>
      <div>
        <TextField
          label="Youtube Url"
          className={classes!.textField}
          value={youtubeUrl}
          onChange={textFieldHandler}
          margin="normal"
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Take screenshot"
                  onClick={screenshotHandler}
                >
                  <PhotoCamera />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </div>
      {!mp4Url ? (
        <CircularProgress className={classes!.progress} />
      ) : (
        <video
          ref={videoRef}
          width={WIDTH}
          height={HEIGHT}
          controls={true}
          autoPlay={true}
          loop={true}
          muted={true}
          style={{
            borderWidth: 5,
            borderStyle: 'solid',
            borderColor: '#ccc'
          }}
          crossOrigin="anonymous"
        >
          <source
            src={`${CORS_PROXY_URL}${mp4Url}`}
            type="video/mp4"
          />
        </video>
      )}
    </div>
  );
}

const cameraPanelSelector = ({ youtubeUrl, mp4Url }: CameraPanelModel) => ({
  youtubeUrl,
  mp4Url
});

const mapStateToProps = ({ cameraPanel }: AppState) => cameraPanelSelector(cameraPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMessage: (message: string) => dispatch(showMessage(message)),
  addImages: (images: Readonly<ImageModel>[]) => dispatch(addImages(images)),
  changeYoutubeUrl: (youtubeUrl: string) => dispatch(changeYoutubeUrl(youtubeUrl))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(YoutubeComponent));
