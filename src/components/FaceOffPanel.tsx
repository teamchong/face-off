import {
  AppBar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Slide,
  Tab,
  Tabs,
  Typography,
} from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import {
  AddPhotoAlternate,
  DeleteSweep,
  Done,
  Info,
  Videocam,
  VideoLibrary,
} from '@material-ui/icons';
import * as React from 'react';
import { Props, ReactElement, ReactNode, ReactType } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector } from 'reselect';
import {
  hideMessage,
  removeImages,
  switchTab,
} from '../actions/FaceOffActions';
import { FaceOffModel, IRootState } from '../models';
import DropzoneComponent from './DropzoneComponent';
import FaceCard from './FaceCard';
import ImageCard from './ImageCard';
import VideoComponent from './VideoComponent';
import WebcamComponent from './WebcamComponent';

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    alignCenter: {
      verticalAlign: 'middle',
    },
    badge: {
      marginRight: '10px',
    },
    br: {
      width: '100%',
    },
    button: {
      margin: spacing.unit,
    },
    card: {
      display: 'inline-block',
      margin: '5px',
    },
    cardActions: {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    container: {
      float: 'left',
      width: '700px',
    },
    faceName: {
      fontSize: '10px',
    },
    faceThumb: {
      height: '120px',
    },
    fold: {
      marginLeft: 'auto',
    },
    imagesContainer: {
      alignContent: 'flex-start',
      alignItems: 'flex-start',
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'flex-start',
    },
    leftIcon: {
      marginRight: spacing.unit,
    },
    removeAll: {
      marginBottom: '5px',
      width: '100%',
    },
    rightIcon: {
      marginLeft: spacing.unit,
    },
    root: {
      backgroundColor: palette.background.paper,
    },
    title: {
      color: '#fff',
      position: 'absolute',
      textShadow: '1px 1px #000',
    },
  });

const faceOffPanelSelector = ({
  tab,
  message,
  images,
  isModelsLoaded,
  isVideoLoaded,
  isWebcamLoaded,
  faces,
  openImageId,
}: FaceOffModel) => ({
  faces,
  images,
  isModelsLoaded,
  isVideoLoaded,
  isWebcamLoaded,
  message,
  openImageId,
  tab,
});

const componentSelector = createSelector(
  faceOffPanelSelector,
  ({
    tab,
    message,
    images,
    isModelsLoaded,
    isVideoLoaded,
    isWebcamLoaded,
    faces,
    openImageId,
  }) => {
    const faceIds = Object.keys(faces);
    const imageIndexes = images.map((_, index) => index);
    const props = {
      faceIds,
      imageIndexes,
      isModelsLoadCompleted:
        isModelsLoaded &&
        ((tab === 'one' && isVideoLoaded) ||
          (tab === 'two' && isWebcamLoaded) ||
          tab === 'three'),
      isVideoLoaded,
      isWebcamLoaded,
      message,
      tab,
    };
    switch (tab) {
      case 'three':
        return { ...props, ActiveTab: DropzoneComponent };
      case 'two':
        return { ...props, ActiveTab: WebcamComponent };
      default:
        return { ...props, ActiveTab: VideoComponent };
    }
  }
);

const mapStateToProps = ({ faceOffPanel }: IRootState) =>
  componentSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  hidingMessage: () => dispatch(hideMessage()),
  removingImages: (imageIndexes: number[]) =>
    dispatch(removeImages(imageIndexes)),
  switchTabHandler: (_: any, value: string) => dispatch(switchTab(value)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { imageIndexes } = stateProps;
  const { removingImages } = dispatchProps;
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    removeAllHandler: () => removingImages(imageIndexes),
  };
};

const Transition = (props: Props<ReactNode>) => (
  <Slide direction="up" {...props} />
);

const TabContainer = ({ children }: Props<ReactNode>): ReactElement<any> => (
  <Typography component="div" style={{ padding: 8 * 2 }}>
    {children}
  </Typography>
);

const FaceOffPanel = ({
  ActiveTab,
  classes,
  faceIds,
  hidingMessage,
  isModelsLoadCompleted,
  isVideoLoaded,
  isWebcamLoaded,
  imageIndexes,
  tab,
  message,
  removeAllHandler,
  switchTabHandler,
}: StyledComponentProps & ReturnType<typeof mergeProps>): ReactElement<any> => (
  <div>
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
        {!isModelsLoadCompleted ? (
          <div>
            <CircularProgress size={12} className={classes!.alignCenter} />{' '}
            Please wait while loading face detection models.
          </div>
        ) : (
          <div>
            <Info className={classes!.alignCenter} {...{ size: 12}} /> Face detection
            is on.
          </div>
        )}
      </div>
      {faceIds.map(faceId => (
        <FaceCard id={faceId} key={faceId} />
      ))}
    </div>
    <Divider variant="middle" />
    {!!imageIndexes.length && (
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
          {imageIndexes.map(index => (
            <ImageCard index={index} key={index} />
          ))}
        </div>
      </div>
    )}
    <Dialog
      open={!!message}
      TransitionComponent={Transition}
      keepMounted={true}
      onClose={hidingMessage}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title">
        <Info className={classes!.alignCenter} {...{ size: 12 }} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={hidingMessage} color="primary">
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
