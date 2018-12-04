import configureStore from './configureStore';
import CamPanel from './components/CameraPanel';
import { Card, CardContent, Grid } from '@material-ui/core';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import './App.css';

const store = configureStore();

const App = () => (
  <Grid container={true}>
    <Card raised={true}>
      <CardContent>
        <CamPanel />
      </CardContent>
    </Card>
  </Grid>
);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
