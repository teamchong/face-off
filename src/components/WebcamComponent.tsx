import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Webcam from 'react-webcam';
import { Dispatch } from 'redux';
import { showMessage } from '../actions/cameraPanelActions';
import { AppState } from '../reducers';
/*
prop	type	default	notes
className	string	''	CSS class of video element
audio	boolean	true	enable/disable audio
height	number	480	height of video element
width	number	640	width of video element
screenshotWidth	number		width of screenshot
style	object		style prop passed to video element
screenshotFormat	string	'image/webp'	format of screenshot
onUserMedia	function	noop	callback for when component receives a media stream
onUserMediaError	function	noop	callback for when component can't receive a media stream with MediaStreamError param
screenshotQuality	number	0.92	quality of screenshot(0 to 1)
audioConstraints	object		MediaStreamConstraint(s) for the audio
videoConstraints	object		MediaStreamConstraints(s) for the video
*/

const WebcamComponent = ({ showMessage }) => (
  <Webcam
    style={{
      borderWidth: 5,
      borderStyle: 'solid',
      borderColor: '#ccc'
    }}
  />
);

const camPanelSelector = ({ message }: { message? }) => ({ message });

const mapStateToProps = ({ camPanel }: AppState) => camPanelSelector(camPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showMessage: message => dispatch(showMessage(message))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WebcamComponent);
