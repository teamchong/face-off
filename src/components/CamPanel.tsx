import { AppBar, Tabs, Tab, Typography } from '@material-ui/core';
import { createStyles, StyledComponentProps, withStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import * as React from 'react';
import { Props, ReactElement, ReactNode, ReactType } from 'react';
import * as Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { MiddlewareAPI } from 'redux';
import * as Webcam from 'react-webcam';
import { switchTab } from '../actions/camPanelActions';
import { CamPanelModel } from '../models';
import { ReactLifeCycleFunctions } from 'recompose';

type CamPanelProps = { tab: string; };
type ActiveTypeProps = { ActiveTab: ReactType };
type CamPanelWithMiddlewareProps =
  Props<ReactNode> &
  ActiveTypeProps &
  StyledComponentProps &
  MiddlewareAPI &
  CamPanelProps;
type ContainerProps = CamPanelProps & Props<ReactNode>;

const styles = ({ palette }: Theme) => createStyles({
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

const CamPanel = ({ ActiveTab, classes, dispatch, tab }: CamPanelWithMiddlewareProps): ReactElement<any> => (
  <div className={classes!.root}>
    <AppBar position="static">
      <Tabs
        value={tab}
        onChange={(_, value) => dispatch(switchTab(value))}
      >
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
  (props: ContainerProps): ReactElement<ContainerProps & ActiveTypeProps> => (
    props.tab === 'two' ? (
      <Container {...props} ActiveTab={Webcam} />
    ) : (
      <Container {...props} ActiveTab={Dropzone} />
    )
  )
);

const stateToProps = ({ tab }: CamPanelModel) => ({ tab });

export default connect(stateToProps)(
  withActiveTab(
    withStyles(styles)(CamPanel)
  )
);
