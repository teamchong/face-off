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
  Tabs,
  Tab,
  Typography,
} from '@material-ui/core';
import {
  AddPhotoAlternate,
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
import { createSelector } from 'reselect';
import { Props, ReactElement, ReactNode, ReactType } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import VideoComponent from './VideoComponent';
import DropzoneComponent from './DropzoneComponent';
import WebcamComponent from './WebcamComponent';
import FaceCard from './FaceCard';
import ImageCard from './ImageCard';
import {
  switchTab,
  hideMessage,
  removeImages,
} from '../actions/FaceOffActions';
import { FaceOffModel, RootState } from '../models';

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      backgroundColor: palette.background.paper,
    },
    container: {
      display: 'inline-block',
      width: '700px',
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
  isModelsLoaded,
  isVideoLoaded,
  isWebcamLoaded,
  faces,
  openImageId,
}: FaceOffModel) => ({
  tab,
  message,
  images,
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
    isModelsLoaded,
    isVideoLoaded,
    isWebcamLoaded,
    faces,
    openImageId,
  }) => {
    const faceIds = Object.keys(faces);
    const imageIndexes = images.map((_, index) => index);
    const props = {
      tab,
      message,
      imageIndexes,
      isModelsLoadCompleted:
        !isModelsLoaded &&
        ((tab == 'one' && isVideoLoaded) ||
          (tab === 'two' && isWebcamLoaded) ||
          tab === 'three'),
      isVideoLoaded,
      isWebcamLoaded,
      faceIds,
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

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  componentSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  switchTabHandler: (_: any, value: string) => dispatch(switchTab(value)),
  hideMessage: () => dispatch(hideMessage()),
  removeImages: (imageIndexes: number[]) =>
    dispatch(removeImages(imageIndexes)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { imageIndexes } = stateProps;
  const { removeImages } = dispatchProps;
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    removeAllHandler: () => removeImages(imageIndexes),
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
  classes,
  ActiveTab,
  faceIds,
  tab,
  message,
  isModelsLoaded,
  isVideoLoaded,
  isWebcamLoaded,
  imageIndexes,
  hideMessage,
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
      {!isModelsLoadCompleted ? (
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
    </div>
    {faceIds.map(faceId => (
      <FaceCard id={faceId} key={faceId} />
    ))}
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
