import { Card, CardContent, Grid } from '@material-ui/core';
import * as React from 'react';
import { Component, ReactType } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { startApp, stopApp } from './actions';
import FaceOffPanel from './components/FaceOffPanel';
import configureStore from './configureStore';

import './index.css';

const store = configureStore();

class App extends Component {
  public componentDidMount() {
    store.dispatch(startApp());
  }
  public componentWillUnmount() {
    store.dispatch(stopApp());
  }
  public render() {
    return (
      <Grid container={true}>
        <Card raised={true}>
          <FaceOffPanel />
        </Card>
      </Grid>
    );
  }
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
