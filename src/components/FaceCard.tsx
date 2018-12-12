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
  Photo,
  Videocam,
  VideoLibrary,
  ExpandMore,
  ExpandLess,
} from '@material-ui/icons';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import * as React from 'react';
import { ReactElement, ReactNode, ReactType } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { openImageDetails } from '../actions/FaceOffActions';
import { FaceOffModel, RootState } from '../models';

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    faceName: {
      fontSize: '10px',
    },
    alignCenter: {
      verticalAlign: 'middle',
    },
    badge: {
      marginRight: '10px',
      fontSize: '9px',
    },
    fold: {
      marginLeft: 'auto',
    },
    faceThumb: {
      display: 'block',
    },
    card: {
      margin: '5px',
      display: 'inline-block',
    },
    cardActions: {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
  });

const faceOffPanelSelector = ({
  images,
  faces,
  openImageId,
}: FaceOffModel) => ({
  images,
  faces,
  openImageId,
});

const toHHMMSS = (second: number) => {
  const sec_num = ~~second;
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num - hours * 3600) / 60);
  const seconds = sec_num - hours * 3600 - minutes * 60;

  const h = hours < 10 ? '0' : '';
  const m = minutes < 10 ? '0' : '';
  const s = seconds < 10 ? '0' : '';
  return h + hours + ':' + m + minutes + ':' + s + seconds;
};

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  openImageDetails: (openImageId: string) =>
    dispatch(openImageDetails(openImageId)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { id } = ownProps;
  const { images, faces, openImageId } = stateProps;
  const { openImageDetails } = dispatchProps;

  const face = faces[id];

  const toHHMMSS = (second: number) => {
    const sec_num = ~~second;
    const hours = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - hours * 3600) / 60);
    const seconds = sec_num - hours * 3600 - minutes * 60;

    const h = hours < 10 ? '0' : '';
    const m = minutes < 10 ? '0' : '';
    const s = seconds < 10 ? '0' : '';
    return h + hours + ':' + m + minutes + ':' + s + seconds;
  };
  
  const videoLog = [];
  const webcamLog = [];
  const imageLog = [];
  const isOpen = openImageId === id;

  if (isOpen) {
    for (const url in face.video) {
      videoLog.push({
        url,
        log: Array.from(face.video[url])
          .map((s: number) => ({ s, l: toHHMMSS(s) }))
          .sort(),
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
    id,
    //name: face.name || '',
    //gender: face.gender,
    //age: face.age,
    preview: face.preview,
    videoLog,
    webcamLog,
    imageLog,
    videoCount: Object.keys(face.video).reduce(
      (total, url) => total + face.video[url].size,
      0
    ),
    webcamCount: face.webcam.size,
    imageCount: face.imageIds.size,
    isOpen,
    clickHandler: () => openImageDetails(isOpen ? '' : id),
    nameChangeHandler: () => {},
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
          width: isOpen ? '100%' : 'auto',
          height: isOpen ? 'auto' : '120px',
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
                    {log.map(({ s, l }, i) => (
                      <option value={s} key={i}>
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
            {imageLog.map(({ src, id }, i) => (
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
