import {
  Badge,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  CircularProgress,
  TextField,
} from '@material-ui/core';
import {
  Photo,
  Videocam,
  VideoLibrary,
  UnfoldMore,
  UnfoldLess,
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
    },
    fold: {
      marginLeft: 'auto',
    },
    faceThumb: {
      height: '120px',
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

  const imageLookup = {};
  for (let i = 0, iL = images.length; i < iL; i++) {
    imageLookup[images[i].id] = images[i];
  }

  const face = faces[id];

  const imgList = {};
  for (const imageId in face.images) {
    const image = imageLookup[imageId];
    if (image) {
      imgList[imageId] = image;
      delete imageLookup[imageId];
    }
  }

  const isOpen = openImageId === id;
  return {
    id,
    name: face.name || `Unknown${id || ''}`,
    gender: face.gender,
    age: face.age,
    preview: face.preview,
    video: face.video,
    webcam: face.webcam,
    imgList,
    videoCount: Object.keys(face.video).length,
    webcamCount: face.webcam.length,
    imageCount: Object.keys(imgList).length,
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
  imgList,
  videoCount,
  webcamCount,
  imageCount,
  isOpen,
  clickHandler,
  nameChangeHandler,
}: StyledComponentProps & ReturnType<typeof mergeProps>): ReactElement<any> => (
  <Card className={classes!.card} key={id} onClick={clickHandler}>
    <CardHeader title={name} className={classes!.faceName} />
    <CardMedia
      component={'image' as any}
      image={preview}
      title={name}
      className={classes!.faceThumb}
    />
    <CardActions className={classes!.cardActions}>
      <Badge
        className={classes!.badge}
        color="secondary"
        badgeContent={videoCount}
        invisible={!videoCount}
      >
        <VideoLibrary />
      </Badge>
      <Badge
        className={classes!.badge}
        color="secondary"
        badgeContent={webcamCount}
        invisible={!webcamCount}
      >
        <Videocam />
      </Badge>
      <Badge
        className={classes!.badge}
        color="secondary"
        badgeContent={imageCount}
        invisible={!imageCount}
      >
        <Photo />
      </Badge>
      {isOpen ? (
        <UnfoldLess className={classes!.fold} />
      ) : (
        <UnfoldMore className={classes!.fold} />
      )}
    </CardActions>
    {isOpen && (
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
    )}
  </Card>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withStyles(styles)(FaceCard));
