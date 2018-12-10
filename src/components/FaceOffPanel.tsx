import {
  AppBar,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Popover,
  Slide,
  Tabs,
  Tab,
  Typography,
} from '@material-ui/core';
import {
  AddPhotoAlternate,
  Delete,
  DeleteSweep,
  Done,
  Info,
  Videocam,
  VideoLibrary,
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
  showMessage,
  hideMessage,
  openImageDetails,
  removeImages,
} from '../actions/FaceOffActions';
import { FaceOffModel, RootState } from '../models';

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: palette.background.paper,
    },
    overlay: {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1,
    },
    facesContainer: {
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      alignContent: 'flex-start',
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
    },
    br: {
      width: '100%',
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
    popper: {
      zIndex: 1,
      '&[x-placement*="bottom"] $arrow': {
        top: 0,
        left: 0,
        marginTop: '-0.9em',
        width: '3em',
        height: '1em',
        '&::before': {
          borderWidth: '0 1em 1em 1em',
          borderColor: `transparent transparent ${
            palette.common.white
          } transparent`,
        },
      },
      '&[x-placement*="top"] $arrow': {
        bottom: 0,
        left: 0,
        marginBottom: '-0.9em',
        width: '3em',
        height: '1em',
        '&::before': {
          borderWidth: '1em 1em 0 1em',
          borderColor: `${
            palette.common.white
          } transparent transparent transparent`,
        },
      },
      '&[x-placement*="right"] $arrow': {
        left: 0,
        marginLeft: '-0.9em',
        height: '3em',
        width: '1em',
        '&::before': {
          borderWidth: '1em 1em 1em 0',
          borderColor: `transparent ${
            palette.common.white
          } transparent transparent`,
        },
      },
      '&[x-placement*="left"] $arrow': {
        right: 0,
        marginRight: '-0.9em',
        height: '3em',
        width: '1em',
        '&::before': {
          borderWidth: '1em 0 1em 1em',
          borderColor: `transparent transparent transparent ${
            palette.common.white
          }`,
        },
      },
    },
    arrow: {
      position: 'absolute',
      fontSize: 7,
      width: '3em',
      height: '3em',
      '&::before': {
        content: '""',
        margin: 'auto',
        display: 'block',
        width: 0,
        height: 0,
        borderStyle: 'solid',
      },
    },
  });

const faceOffPanelSelector = ({
  tab,
  message,
  images,
  imagesOverlayRef,
  isModelsLoaded,
  faces,
  openImageId,
}: FaceOffModel) => ({
  tab,
  message,
  images,
  imagesOverlayRef,
  isModelsLoaded,
  faces,
  openImageId,
});

const activeTabSelector = createSelector(
  faceOffPanelSelector,
  ({
    tab,
    message,
    images,
    imagesOverlayRef,
    isModelsLoaded,
    faces,
    openImageId,
  }) => {
    const imageLookup = {};
    for (let i = 0, iL = images.length; i < iL; i++) {
      imageLookup[images[i].id] = images[i];
    }
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
        preview: face.preview,
        video: face.video,
        webcam: face.webcam,
        imgList: imgList,
      });
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
          faceGroup,
          openImageId,
          ActiveTab: DropzoneComponent,
        };
      case 'two':
        return {
          tab,
          message,
          images,
          imagesOverlayRef,
          isModelsLoaded,
          faceGroup,
          openImageId,
          ActiveTab: WebcamComponent,
        };
      default:
        return {
          tab,
          message,
          images,
          imagesOverlayRef,
          isModelsLoaded,
          faceGroup,
          openImageId,
          ActiveTab: VideoComponent,
        };
    }
  }
);

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  activeTabSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  switchTab(tab: string) {
    dispatch(switchTab(tab));
  },
  showMessage(message: string) {
    dispatch(showMessage(message));
  },
  hideMessage() {
    dispatch(hideMessage());
  },
  removeImages(imageIndexes: number[]) {
    dispatch(removeImages(imageIndexes));
  },
  openImageDetails(openImageId: string) {
    dispatch(openImageDetails(openImageId));
  },
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
  images,
  imagesOverlayRef,
  openImageId,
  switchTab,
  hideMessage,
  showMessage,
  removeImages,
  openImageDetails,
}: StyledComponentProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>): ReactElement<any> => {
  const removeAllHandler = () => removeImages(images.map((image, i) => i));
  const switchTabHandler = (_: any, value: string) => switchTab(value);
  return (
    <Fragment>
      <div className={classes!.root}>
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
        <Dialog
          open={!!message}
          TransitionComponent={Transition}
          keepMounted={true}
          onClose={hideMessage}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            {"Use Google's location service?"}
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
      <div className={classes!.br} />
      <div className={classes!.facesContainer}>
        {openImageId}
        {faceGroup.map(({ id, name, preview, video, webcam, imgList }) => {
          const popperClickHandler = () => openImageDetails(id);
          return (
            <Card className={classes!.card} key={id || null}>
              <CardActionArea>
                {!!name && (
                  <CardContent className={classes!.title}>
                    {name || `Unknown ${id || ''}`}
                  </CardContent>
                )}
                <img
                  src={preview}
                  title={name || `Unknown ${id || ''}`}
                  height={120}
                  className={classes!.card}
                />
              </CardActionArea>
              <CardActions className={classes!.cardActions}>
                <Button
                  size="small"
                  color="primary"
                  onClick={popperClickHandler}
                >
                  Detail
                </Button>
                <Popover
                  open={openImageId === id}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  {JSON.stringify({ video, webcam, imgList })}
                </Popover>
              </CardActions>
            </Card>
          );
        })}
      </div>
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
          <div className={classes!.facesContainer}>
            {faceGroup.map(({ id, name, preview }) => (
              <Card className={classes!.card} key={id || null}>
                <CardActionArea>
                  {!!name && (
                    <CardContent className={classes!.title}>
                      {name || `Unknown ${id || ''}`}
                    </CardContent>
                  )}
                  <img
                    src={preview}
                    title={name || `Unknown ${id || ''}`}
                    width={100}
                    height={100}
                    className={classes!.card}
                  />
                </CardActionArea>
                <CardActions className={classes!.cardActions}>
                  <Button size="small" color="primary">
                    Detail
                  </Button>
                </CardActions>
              </Card>
            ))}
          </div>
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
      {!isModelsLoaded ? (
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
    </Fragment>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(FaceOffPanel));
