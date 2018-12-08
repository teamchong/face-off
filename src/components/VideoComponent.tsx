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
import {
  CORS_PROXY_URL,
  FACINGMODE_REAR,
  FACINGMODE_FRONT,
} from '../constants';
import {
  showMessage,
  changeVideoUrl,
  addImages,
  fetchMp4Url,
  loadedVideo,
  screenshotVideo,
} from '../actions/FaceOffActions';
import { MAX_WIDTH, MAX_HEIGHT } from '../constants';
import { FaceOffModel } from '../models';
import { RootState } from '../reducers';

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
  videoCtx,
  mp4Url,
  tab,
}: FaceOffModel) => ({
  videoRef,
  videoOverlayRef,
  videoUrl,
  videoUrlLoaded,
  videoCtx,
  mp4Url,
  tab,
});

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMessage: (message: string) => dispatch(showMessage(message)),
  addImages: (images: HTMLImageElement[]) => dispatch(addImages(images)),
  changeVideoUrl: (videoUrl: string) => dispatch(changeVideoUrl(videoUrl)),
  fetchMp4Url: (videoUrl: string) => dispatch(fetchMp4Url(videoUrl)),
  loadedVideo: () => dispatch(loadedVideo()),
  screenshotVideo: () => dispatch(screenshotVideo()),
});

const VideoComponent = ({
  classes,
  videoRef,
  videoOverlayRef,
  videoUrl,
  videoUrlLoaded,
  videoCtx,
  mp4Url,
  tab,
  showMessage,
  changeVideoUrl,
  fetchMp4Url,
  loadedVideo,
  addImages,
}: StyledComponentProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>) => {
  const readAsDataURL = () =>
    new Promise<string>(resolve => {
      let { videoWidth, videoHeight } = videoRef.current as any;
      if (videoWidth > MAX_WIDTH) {
        videoHeight = ~~((MAX_WIDTH * videoHeight) / videoWidth);
        videoWidth = MAX_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx !== null) {
        ctx.drawImage(videoRef.current as any, 0, 0, videoWidth, videoHeight);
        ctx.canvas.toBlob(blob => resolve(createObjectURL(blob)));
      }
    });
  const textFieldHandler = ({ target }: ChangeEvent<HTMLInputElement>) =>
    changeVideoUrl(target!.value);
  const loadMp4Handler = () => fetchMp4Url(videoUrl);
  const playHandler = () => {
    if (tab === 'one' && videoRef.current) {
      const video: HTMLVideoElement = videoRef.current;
      const { videoWidth, videoHeight } = video;
      videoCtx.canvas.width = videoWidth;
      videoCtx.canvas.height = videoHeight;
      videoCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
    }
  };
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
  const videoUrlTrimmed = (videoUrl || '').replace(/^\s+|\s+$/g, '');
  const loadedDataHandler = () => loadedVideo();
  const keyDownHandler = (ev: KeyboardEvent<HTMLElement>) => {
    switch (ev.charCode) {
      case 13:
        loadMp4Handler();
        break;
    }
  };
  return (
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
            autoPlay={false}
            loop={true}
            muted={true}
            playsInline={true}
            style={{
              borderWidth: 5,
              borderStyle: 'solid',
              borderColor: '#ccc',
            }}
            crossOrigin="anonymous"
            onCanPlay={loadedDataHandler}
            onPlay={playHandler}
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
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(VideoComponent));
