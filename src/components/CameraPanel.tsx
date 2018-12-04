import {
  AppBar,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Tabs,
  Tab,
  Typography
} from '@material-ui/core';
import {
  AddPhotoAlternate,
  Delete,
  DeleteSweep,
  Done,
  Videocam
  VideoLibrary
} from '@material-ui/icons';
import {
  createStyles,
  StyledComponentProps,
  withStyles
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import * as React from 'react';
import { Props, ReactElement, ReactNode, ReactType } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ReactLifeCycleFunctions } from 'recompose';
import YoutubeComponent from './YoutubeComponent';
import DropzoneComponent from './DropzoneComponent';
import WebcamComponent from './WebcamComponent';
import {
  switchTab,
  showMessage,
  hideMessage,
  removeImages
} from '../actions/cameraPanelActions';
import { CameraPanelModel } from '../models';
import { AppState } from '../reducers';

type Actions = { switchTab; showMessage; hideMessage; removeImages };
type ActiveTypeProps = { ActiveTab: ReactType };
type CameraPanelConnectedProps = Props<ReactNode> &
  ActiveTypeProps &
  StyledComponentProps &
  Actions &
  CameraPanelModel;
type ContainerProps = CameraPanelModel & Props<ReactNode>;

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: palette.background.paper
    },
    title: {
      position: 'absolute'
    },
    br: {
      width: '100%'
    },
    removeAll: {
      width: '100%',
      marginBottom: '5px'
    },
    button: {
      margin: spacing.unit
    },
    leftIcon: {
      marginRight: spacing.unit
    },
    rightIcon: {
      marginLeft: spacing.unit
    },
    card: {
      margin: '5px',
      display: 'inline-block'
    },
    cardActions: {
      backgroundColor: 'rgba(0,0,0,0.1)'
    }
  });

const Transition = props => <Slide direction="up" {...props} />;

const TabContainer = ({ children }: Props<ReactNode>): ReactElement<any> => (
  <Typography component="div" style={{ padding: 8 * 2 }}>
    {children}
  </Typography>
);

const CameraPanel = ({
  ActiveTab,
  classes,
  message,
  tab,
  switchTab,
  hideMessage,
  showMessage,
  removeImages,
  images
}: CameraPanelConnectedProps): ReactElement<any> => (
  <React.Fragment>
    {!!images.length && (
      <div>
        {images.map(({ name, width, height, preview }, i) => (
          <Card className={classes.card}>
            <CardActionArea>
              <CardContent className={classes.title}>{name}</CardContent>
              <img
                src={preview}
                title={name}
                width={width}
                height={height}
                className={classes.card}
              />
            </CardActionArea>
            <CardActions className={classes.cardActions}>
              <Button
                size="small"
                color="primary"
                onClick={() => removeImages([i])}
              >
                <Delete /> Remove
              </Button>
            </CardActions>
          </Card>
        ))}
        <div className={classes.br} />
        <Button
          variant="contained"
          color="primary"
          className={classes.removeAll}
          onClick={() => removeImages(images.map((image, i) => i))}
        >
          <DeleteSweep /> Remove all
        </Button>
      </div>
    )}
    <div className={classes!.root}>
      <AppBar position="static">
        <Tabs value={tab} onChange={(_, value) => switchTab(value)} fullWidth>
          <Tab value="one" icon={<VideoLibrary />} />
          <Tab value="two" icon={<AddPhotoAlternate />} />
          <Tab value="three" icon={<Videocam />} />
        </Tabs>
      </AppBar>
      <TabContainer>
        <ActiveTab />
      </TabContainer>
      <Dialog
        open={!!message}
        TransitionComponent={Transition}
        keepMounted
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
  </React.Fragment>
);

const withActiveTab = (Container: ReactType) => (
  props: ContainerProps
): ReactElement<ContainerProps & ActiveTypeProps> =>
  props.tab === 'three' ? (
    <Container {...props} ActiveTab={WebcamComponent} />
  ) : props.tab === 'two' ? (
    <Container {...props} ActiveTab={DropzoneComponent} />
  ) : (
    <Container {...props} ActiveTab={YoutubeComponent} />
  );

const cameraPanelSelector = ({ tab, message, images }) => ({
  tab,
  message,
  images
});

const mapStateToProps = ({ cameraPanel }: AppState) =>
  cameraPanelSelector(cameraPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  switchTab: tab => dispatch(switchTab(tab)),
  showMessage: message => dispatch(showMessage(message)),
  hideMessage: () => dispatch(hideMessage()),
  removeImages: imageIndexes => dispatch(removeImages(imageIndexes))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(withActiveTab(CameraPanel)));
