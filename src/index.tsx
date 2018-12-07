import configureStore from './configureStore';
import FaceOffPanel from './components/FaceOffPanel';
import { Card, CardContent, Grid } from '@material-ui/core';
import * as React from 'react';
import { Component, ReactType } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { startApp, stopApp } from './actions';

import './index.css';

const store = configureStore();

class App extends Component {
  componentDidMount() {
    store.dispatch(startApp());
  }
  componentWillUnmount() {
    store.dispatch(stopApp());
  }
  render() {
    return (
      <Grid container={true}>
        <Card raised={true}>
          <CardContent>
            <FaceOffPanel />
          </CardContent>
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
