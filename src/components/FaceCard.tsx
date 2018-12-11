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

  const isOpen = openImageId === id;
  return {
    id,
    name: face.name || '',
    gender: face.gender,
    age: face.age,
    preview: face.preview,
    video: face.video,
    webcam: face.webcam,
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
  name,
  gender,
  age,
  preview,
  video,
  webcam,
  videoCount,
  webcamCount,
  imageCount,
  isOpen,
  clickHandler,
  nameChangeHandler,
}: StyledComponentProps & ReturnType<typeof mergeProps>): ReactElement<any> => (
  <Card className={classes!.card} key={id} onClick={clickHandler}>
    <div>
      {!!name && <div className={classes!.title}>{name}</div>}
      <img src={preview} title={name} className={classes!.faceThumb} style={{height: isOpen ? 'auto' : '120px'}}/>
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
      <IconButton className={classes!.fold}>
      {isOpen ? (
        <ExpandLess />
      ) : (
        <ExpandMore />
      )}
      </IconButton>
    </CardActions>
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
      <CardContent>
        <TextField
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
            <CircularProgress size={12} className={classes!.alignCenter} />{' '}
            Gender
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
            <CircularProgress size={12} className={classes!.alignCenter} /> Age
          </div>
        )}
      </CardContent>
      </Collapse>
  </Card>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withStyles(styles)(FaceCard));
