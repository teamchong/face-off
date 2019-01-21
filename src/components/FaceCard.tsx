import {
  Badge,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  IconButton,
  TextField,
} from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import {
  ExpandLess,
  ExpandMore,
  Photo,
  Videocam,
  VideoLibrary,
} from '@material-ui/icons';
import * as React from 'react';
import { ReactElement, ReactNode, ReactType } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { openImageDetails } from '../actions/FaceOffActions';
import { IFaceOffModel, IRootState } from '../models';

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    alignCenter: {
      verticalAlign: 'middle',
    },
    badge: {
      fontSize: '9px',
      marginRight: '10px',
    },
    card: {
      display: 'inline-block',
      margin: '5px',
    },
    cardActions: {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    faceName: {
      fontSize: '10px',
    },
    faceThumb: {
      display: 'block',
    },
    fold: {
      marginLeft: 'auto',
    },
  });

const faceOffPanelSelector = ({
  images,
  faces,
  openImageId,
}: IFaceOffModel) => ({
  faces,
  images,
  openImageId,
});

const toHHMMSS = (second: number) => {
  // tslint:disable-next-line:no-bitwise
  const secNum = ~~second;
  const hours = Math.floor(secNum / 3600);
  const minutes = Math.floor((secNum - hours * 3600) / 60);
  const seconds = secNum - hours * 3600 - minutes * 60;

  const h = hours < 10 ? '0' : '';
  const m = minutes < 10 ? '0' : '';
  const s = seconds < 10 ? '0' : '';
  return h + hours + ':' + m + minutes + ':' + s + seconds;
};

const mapStateToProps = ({ faceOffPanel }: IRootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  openingImageDetails: (openImageId: string) =>
    dispatch(openImageDetails(openImageId)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { id } = ownProps;
  const { images, faces, openImageId } = stateProps;
  const { openingImageDetails } = dispatchProps;

  const face = faces[id];
  const videoLog: Array<{ log: Array<{ s: number, l: string }>, url: string }> = [];
  const webcamLog: string[] = [];
  const imageLog: HTMLImageElement[] = [];
  const isOpen = openImageId === id;

  if (isOpen) {
    // tslint:disable-next-line:forin
    for (const url in face.video) {
      videoLog.push({
        log: Array.from(face.video[url] as number[])
          .map((s: number) => ({ s, l: toHHMMSS(s) }))
          .sort(),
        url,
      });
    }

    face.webcam.forEach(t =>
      webcamLog.push(new Date(t).toLocaleString('en-GB'))
    );
    
    const imageLookup = {};
    for (const image of images) {
      imageLookup[image.id] = image;
    }
    face.imageIds.forEach(imageId => {
      const image = imageLookup[imageId];
      if (image) {
        imageLog.push(image);
      }
    });
  }

  return {
    clickHandler: () => openingImageDetails(isOpen ? '' : id),
    id,
    // name: face.name || '',
    // gender: face.gender,
    // age: face.age,
    imageCount: face.imageIds.size,
    imageLog,
    isOpen,
    nameChangeHandler: () => ({}),
    preview: face.preview,
    videoCount: Object.keys(face.video).reduce(
      (total, url) => total + face.video[url].size,
      0
    ),
    videoLog,
    webcamCount: face.webcam.size,
    webcamLog,
  };
};
const FaceCard = ({
  classes,
  id,
  // name,
  // gender,
  // age,
  preview,
  videoLog,
  webcamLog,
  imageLog,
  videoCount,
  webcamCount,
  imageCount,
  isOpen,
  clickHandler,
}: // nameChangeHandler,
StyledComponentProps & ReturnType<typeof mergeProps>): ReactElement<any> => (
  <Card className={classes!.card} key={id}>
    <div>
      {/*name && <div className={classes!.title}>{name}</div>*/}
      <img
        src={preview}
        className={classes!.faceThumb}
        style={{
          height: isOpen ? 'auto' : '120px',
          width: isOpen ? '100%' : 'auto',
        }}
      />
    </div>
    <CardActions className={classes!.cardActions}>
      {!!videoCount && (
        <Badge
          className={classes!.badge}
          color="secondary"
          badgeContent={videoCount}
        >
          <VideoLibrary />
        </Badge>
      )}
      {!!webcamCount && (
        <Badge
          className={classes!.badge}
          color="secondary"
          badgeContent={webcamCount}
        >
          <Videocam />
        </Badge>
      )}
      {!!imageCount && (
        <Badge
          className={classes!.badge}
          color="secondary"
          badgeContent={imageCount}
        >
          <Photo />
        </Badge>
      )}
      <IconButton className={classes!.fold} onClick={clickHandler}>
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </IconButton>
    </CardActions>
    {isOpen ? (
      <CardContent>
        {/*<TextField
          label="Name"
          value={name}
          onChange={nameChangeHandler}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        {gender ? (
          <TextField
            label="Gender"
            value={gender}
            onChange={nameChangeHandler}
            fullWidth
            margin="normal"
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />
        ) : (
          <div>
            Gender:{' '}
            <CircularProgress size={12} className={classes!.alignCenter} />
          </div>
        )}
        {age ? (
          <TextField
            label="Age"
            value={age}
            onChange={nameChangeHandler}
            fullWidth
            margin="normal"
            variant="outlined"
            InputProps={{
              readOnly: true,
            }}
          />
        ) : (
          <div>
            Age: <CircularProgress size={12} className={classes!.alignCenter} />
          </div>
        )}*/}
        {!!videoLog.length && (
          <div>
            Video log:
            {videoLog.map(({ url, log }, i) => (
              <div key={i}>
                <a href={url} target="_blank">
                  {url}
                </a>
                <div>
                  <select style={{ width: '100%' }}>
                    {log.map(({ s, l }, logI) => (
                      <option value={s} key={logI}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
        {!!webcamLog.length && (
          <div>
            WebCam log:
            {webcamLog.map((time, i) => (
              <div key={i}>{time}</div>
            ))}
          </div>
        )}
        {!!imageLog.length && (
          <div>
            <div>Appear in images:</div>
            {imageLog.map(({ src }, i) => (
              <a href={src} target="_blank" key={i}>
                <img src={src} height="50" />
              </a>
            ))}
          </div>
        )}
      </CardContent>
    ) : null}
  </Card>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withStyles(styles)(FaceCard));
