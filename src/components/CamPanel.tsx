import { AppBar, Tabs, Tab, Typography } from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import * as React from 'react';
import { Props, ReactElement, ReactNode, ReactType } from 'react';
import * as Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as Webcam from 'react-webcam';
import { ReactLifeCycleFunctions } from 'recompose';
import { switchTab } from '../actions/camPanelActions';
import { CamPanelModel } from '../models';
import { AppState } from '../reducers';

type CamPanelProps = { tab: string };
type ActiveTypeProps = { ActiveTab: ReactType };
type CamPanelConnectedProps = Props<ReactNode> &
  ActiveTypeProps &
  StyledComponentProps & { switchTab: typeof switchTab } & CamPanelProps;
type ContainerProps = CamPanelProps & Props<ReactNode>;

const styles = ({ palette }: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: palette.background.paper
    }
  });

const TabContainer = ({ children }: Props<ReactNode>): ReactElement<any> => (
  <Typography component="div" style={{ padding: 8 * 2 }}>
    {children}
  </Typography>
);

const CamPanel = ({
  ActiveTab,
  classes,
  switchTab,
  tab
}: CamPanelConnectedProps): ReactElement<any> => (
  <div className={classes!.root}>
    <AppBar position="static">
      <Tabs value={tab} onChange={(_, value) => switchTab(value)}>
        <Tab value="one" label="Image" />
        <Tab value="two" label="Live Camera" />
      </Tabs>
    </AppBar>
    <TabContainer>
      <ActiveTab />
    </TabContainer>
  </div>
);

const withActiveTab = (Container: ReactType) => (
  props: ContainerProps
): ReactElement<ContainerProps & ActiveTypeProps> =>
  props.tab === 'two' ? (
    <Container {...props} ActiveTab={Webcam} />
  ) : (
    <Container {...props} ActiveTab={Dropzone} />
  );

const camPanelSelector = ({ tab }) => ({ tab });

const mapStateToProps = ({ camPanel }: AppState) => camPanelSelector(camPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  switchTab: tab => dispatch(switchTab(tab))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withActiveTab(withStyles(styles)(CamPanel)));
