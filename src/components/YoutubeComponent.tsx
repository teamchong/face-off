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
import { createRef, ChangeEvent, Fragment } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
  CORS_PROXY_URL,
  FACINGMODE_REAR,
  FACINGMODE_FRONT,
} from '../constants';
import {
  showMessage,
  changeYoutubeUrl,
  addImages,
  fetchMp4Url,
  loadedVideo,
} from '../actions/FaceOffActions';
import { FaceOffModel } from '../models';
import { RootState } from '../reducers';

const WIDTH = 640;
const HEIGHT = 480;

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
      width: WIDTH + 'px',
      marginLeft: spacing.unit,
      marginRight: spacing.unit,
    },
  });

const videoRef = createRef<HTMLVideoElement>();

type Actions = {
  showMessage: typeof showMessage;
  changeYoutubeUrl: typeof changeYoutubeUrl;
  fetchMp4Url: typeof fetchMp4Url;
  loadedVideo: typeof loadedVideo;
  addImages: typeof addImages;
};
type YoutubeComponentProps = StyledComponentProps &
  Actions &
  Partial<FaceOffModel>;
const YoutubeComponent = ({
  classes,
  videoRef,
  videoOverlayRef,
  youtubeUrl,
  youtubeUrlLoaded,
  mp4Url,
  showMessage,
  changeYoutubeUrl,
  fetchMp4Url,
  loadedVideo,
  addImages,
}: YoutubeComponentProps) => {
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
  };
  const textFieldHandler = ({ target }: ChangeEvent<HTMLInputElement>) =>
    changeYoutubeUrl(target!.value);
  const playHandler = () => fetchMp4Url(youtubeUrl);
  const screenshotHandler = async () => {
    const src = (await readAsDataURL()) || '';
    addImages([
      await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgEl = new Image();
        imgEl.title = `Video-${new Date()
          .toLocaleString('en-GB')
          .replace('/', '-')
          .replace(/[,]/g, '')}.jpg`;
        imgEl.onload = () => resolve(imgEl);
        imgEl.onerror = error => reject(error);
        imgEl.src = src;
      }),
    ]);
  };
  const youtubeUrlTrimmed = (youtubeUrl || '').replace(/^\s+|\s+$/g, '');
  const loadedDataHandler = () => loadedVideo();
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
                {!!youtubeUrlTrimmed && youtubeUrlTrimmed !== youtubeUrlLoaded && (
                  <IconButton
                    aria-label="Take screenshot"
                    onClick={playHandler}
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
            width={WIDTH}
            height={HEIGHT}
            ref={videoOverlayRef}
          />
          <video
            ref={videoRef}
            width={WIDTH}
            height={HEIGHT}
            controls={true}
            autoPlay={false}
            loop={true}
            muted={true}
            style={{
              borderWidth: 5,
              borderStyle: 'solid',
              borderColor: '#ccc',
            }}
            crossOrigin="anonymous"
            onCanPlay={loadedDataHandler}
          >
            <source src={`${CORS_PROXY_URL}${mp4Url}`} type="video/mp4" />
          </video>
        </Fragment>
      ) : (
        !!youtubeUrlTrimmed && (
          <CircularProgress className={classes!.progress} />
        )
      )}
    </div>
  );
};

const faceOffPanelSelector = ({
  videoRef,
  videoOverlayRef,
  youtubeUrl,
  youtubeUrlLoaded,
  mp4Url,
}: FaceOffModel) => ({
  videoRef,
  videoOverlayRef,
  youtubeUrl,
  youtubeUrlLoaded,
  mp4Url,
});

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMessage: (message: string) => dispatch(showMessage(message)),
  addImages: (images: HTMLImageElement[]) => dispatch(addImages(images)),
  changeYoutubeUrl: (youtubeUrl: string) =>
    dispatch(changeYoutubeUrl(youtubeUrl)),
  fetchMp4Url: (youtubeUrl: string) => dispatch(fetchMp4Url(youtubeUrl)),
  loadedVideo: () => dispatch(loadedVideo()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(YoutubeComponent));
