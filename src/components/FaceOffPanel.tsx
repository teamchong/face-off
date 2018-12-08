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
import { Props, ReactElement, ReactNode, ReactType } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import YoutubeComponent from './YoutubeComponent';
import DropzoneComponent from './DropzoneComponent';
import WebcamComponent from './WebcamComponent';
import {
  switchTab,
  showMessage,
  hideMessage,
  removeImages,
} from '../actions/FaceOffActions';
import { FaceOffModel } from '../models';
import { RootState } from '../reducers';

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: palette.background.paper,
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
  });

const faceOffPanelSelector = ({
  tab,
  message,
  images,
  isModelsLoaded,
}: FaceOffModel) => ({
  tab,
  message,
  images,
  isModelsLoaded,
});

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  faceOffPanelSelector(faceOffPanel);

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
});

const Transition = (props: Props<ReactNode>) => (
  <Slide direction="up" {...props} />
);

const TabContainer = ({ children }: Props<ReactNode>): ReactElement<any> => (
  <Typography component="div" style={{ padding: 8 * 2 }}>
    {children}
  </Typography>
);

type ContainerProps = StyledComponentProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
type ActiveTypeProps = { ActiveTab: ReactType };

const withActiveTab = (Container: ReactType) => (
  props: ContainerProps
): ReactElement<ContainerProps & ActiveTypeProps> =>
  props.tab === 'three' ? (
    <Container {...props} ActiveTab={DropzoneComponent} />
  ) : props.tab === 'two' ? (
    <Container {...props} ActiveTab={WebcamComponent} />
  ) : (
    <Container {...props} ActiveTab={YoutubeComponent} />
  );

const FaceOffPanel = ({
  classes,
  ActiveTab,
  message,
  tab,
  isModelsLoaded,
  switchTab,
  hideMessage,
  showMessage,
  removeImages,
  images,
}: ContainerProps & ActiveTypeProps): ReactElement<any> => {
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
            {images.map(({ title, width, height, src }, i) => {
              const removeImageHandler = () => removeImages([i]);
              return (
                <Card
                  className={classes!.card}
                  key={i}
                  style={{ order: images.length - i }}
                >
                  <CardActionArea>
                    <CardContent className={classes!.title}>{name}</CardContent>
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
    </Fragment>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withActiveTab(FaceOffPanel)));
