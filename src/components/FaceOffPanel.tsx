import {
  AppBar,
  Button,
  Badge,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  AddPhotoAlternate,
  Delete,
  DeleteSweep,
  Done,
  Info,
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
import { Fragment } from 'react';
import { createSelector } from 'reselect';
import { Props, ReactElement, ReactNode, ReactType } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import VideoComponent from './VideoComponent';
import DropzoneComponent from './DropzoneComponent';
import WebcamComponent from './WebcamComponent';
import {
  switchTab,
  hideMessage,
  openImageDetails,
  removeImages,
} from '../actions/FaceOffActions';
import { FaceOffModel, RootState } from '../models';

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      alignContent: 'flex-start',
      backgroundColor: palette.background.paper,
    },
    container: {
      display: 'inline-block',
      width: '700px',
    },
    overlay: {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1,
    },
    faceName: {
      fontSize: '10px',
    },
    imagesContainer: {
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      alignContent: 'flex-start',
    },
    alignCenter: {
      verticalAlign: 'middle',
    },
    title: {
      position: 'absolute',
      color: '#fff',
      textShadow: '1px 1px #000',
    },
    badge: {
      marginRight: '10px',
    },
    fold: {
      marginLeft: 'auto',
    },
    br: {
      width: '100%',
    },
    faceThumb: {
      height: '120px',
    },
    removeAll: {
      width: '100%',
      marginBottom: '5px',
    },
    button: {
      margin: spacing.unit,
    },
    leftIcon: {
      marginRight: spacing.unit,
    },
    rightIcon: {
      marginLeft: spacing.unit,
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
  tab,
  message,
  images,
  imagesOverlayRef,
  isModelsLoaded,
  isVideoLoaded,
  isWebcamLoaded,
  faces,
  openImageId,
}: FaceOffModel) => ({
  tab,
  message,
  images,
  imagesOverlayRef,
  isModelsLoaded,
  isVideoLoaded,
  isWebcamLoaded,
  faces,
  openImageId,
});

const componentSelector = createSelector(
  faceOffPanelSelector,
  ({
    tab,
    message,
    images,
    imagesOverlayRef,
    isModelsLoaded,
    isVideoLoaded,
    isWebcamLoaded,
    faces,
    openImageId,
  }) => {
    const imageLookup = {};
    for (let i = 0, iL = images.length; i < iL; i++) {
      imageLookup[images[i].id] = images[i];
    }
    let imageDetails = null;
    const faceGroup = [];
    for (const id in faces) {
      const face = faces[id];

      const imgList = {};
      for (const imageId in face.images) {
        const image = imageLookup[imageId];
        if (image) {
          imgList[imageId] = image;
          delete imageLookup[imageId];
        }
      }

      faceGroup.push({
        id: id,
        name: face.name || `Unknown${id || ''}`,
        gender: face.gender,
        age: face.age,
        preview: face.preview,
        videoCount: Object.keys(face.video).length,
        webcamCount: face.webcam.length,
        imageCount: Object.keys(imgList).length,
      });
      if (openImageId === id) {
        imageDetails = {
          id,
          preview: face.preview,
          video: face.video,
          webcam: face.webcam,
          images: imgList,
        };
      }
    }
    images = Object.keys(imageLookup).map(imageId => imageLookup[imageId]);
    switch (tab) {
      case 'three':
        return {
          tab,
          message,
          images,
          imagesOverlayRef,
          isModelsLoaded,
          isVideoLoaded,
          isWebcamLoaded,
          faceGroup,
          imageDetails,
          ActiveTab: DropzoneComponent,
        };
      case 'two':
        return {
          tab,
          message,
          images,
          imagesOverlayRef,
          isModelsLoaded,
          isVideoLoaded,
          isWebcamLoaded,
          faceGroup,
          imageDetails,
          ActiveTab: WebcamComponent,
        };
      default:
        return {
          tab,
          message,
          images,
          imagesOverlayRef,
          isModelsLoaded,
          isVideoLoaded,
          isWebcamLoaded,
          faceGroup,
          imageDetails,
          ActiveTab: VideoComponent,
        };
    }
  }
);

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  componentSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  switchTabHandler: (_: any, value: string) => dispatch(switchTab(value)),
  hideMessage: () => dispatch(hideMessage()),
  removeImages: (imageIndexes: number[]) =>
    dispatch(removeImages(imageIndexes)),
  openImageDetails: (openImageId: string) =>
    dispatch(openImageDetails(openImageId)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
  removeAllHandler: () =>
    dispatchProps.removeImages(stateProps.images.map((image, i) => i)),
});

const Transition = (props: Props<ReactNode>) => (
  <Slide direction="up" {...props} />
);

const TabContainer = ({ children }: Props<ReactNode>): ReactElement<any> => (
  <Typography component="div" style={{ padding: 8 * 2 }}>
    {children}
  </Typography>
);

const FaceOffPanel = ({
  classes,
  ActiveTab,
  faceGroup,
  tab,
  message,
  isModelsLoaded,
  isVideoLoaded,
  isWebcamLoaded,
  images,
  imagesOverlayRef,
  imageDetails,
  hideMessage,
  removeImages,
  openImageDetails,
  removeAllHandler,
  switchTabHandler,
}: StyledComponentProps & ReturnType<typeof mergeProps>): ReactElement<any> => (
  <div className={classes!.root}>
    <div className={classes!.container}>
      <AppBar position="static">
        <Tabs value={tab} onChange={switchTabHandler} fullWidth={true}>
          <Tab value="one" icon={<VideoLibrary />} />
          <Tab value="two" icon={<Videocam />} />
          <Tab value="three" icon={<AddPhotoAlternate />} />
        </Tabs>
      </AppBar>
      <TabContainer>
        <ActiveTab />
      </TabContainer>
    </div>
    {faceGroup.map(
      ({
        id,
        name,
        gender,
        age,
        preview,
        videoCount,
        webcamCount,
        imageCount,
      }) => {
        const isOpen = !!imageDetails && imageDetails.id === id;
        const clickHandler = () => openImageDetails(isOpen ? '' : id);
        const nameChangeHandler = () => {};
        return (
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
                    <CircularProgress
                      size={12}
                      className={classes!.alignCenter}
                    />{' '}
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
                    <CircularProgress
                      size={12}
                      className={classes!.alignCenter}
                    />{' '}
                    Age
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      }
    )}
    <div className={classes!.br} />
    {!!images.length && (
      <div>
        <Button
          variant="contained"
          color="primary"
          className={classes!.removeAll}
          onClick={removeAllHandler}
        >
          <DeleteSweep /> Remove all
        </Button>
        <div className={classes!.br} />
        <div className={classes!.imagesContainer}>
          {images.map(({ id, title, width, height, src }, i) => {
            const removeImageHandler = () => removeImages([i]);
            return (
              <Card
                className={classes!.card}
                key={i}
                style={{ order: images.length - i }}
              >
                <CardActionArea>
                  <CardContent className={classes!.title}>{name}</CardContent>
                  <canvas
                    ref={imagesOverlayRef[id]}
                    width={width}
                    height={height}
                    className={classes!.overlay}
                  />
                  <img
                    src={src}
                    title={title}
                    width={width}
                    height={height}
                    className={classes!.card}
                  />
                </CardActionArea>
                <CardActions className={classes!.cardActions}>
                  <Button
                    size="small"
                    color="primary"
                    onClick={removeImageHandler}
                  >
                    <Delete /> Remove
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </div>
      </div>
    )}
    {!isModelsLoaded &&
    ((tab == 'one' && isVideoLoaded) ||
      (tab === 'two' && isWebcamLoaded) ||
      tab === 'three') ? (
      <div>
        <CircularProgress size={12} className={classes!.alignCenter} /> Please
        wait while loading face detection models.
      </div>
    ) : (
      <div>
        <Info size={12} className={classes!.alignCenter} /> Face detection is
        on.
      </div>
    )}
    <Dialog
      open={!!message}
      TransitionComponent={Transition}
      keepMounted={true}
      onClose={hideMessage}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">
        <Info size={12} className={classes!.alignCenter} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={hideMessage} color="primary">
          <Done />
        </Button>
      </DialogActions>
    </Dialog>
  </div>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withStyles(styles)(FaceOffPanel));
