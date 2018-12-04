import { Button, Typography } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { Collections } from '@material-ui/icons';
import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { addImages, showMessage } from '../actions/cameraPanelActions';
import { AppState } from '../reducers';

const styles = () =>
  createStyles({
    typography: {
      color: 'rgba(255,255,255,0.9)'
    },
    br: {
      width: '100%'
    },
    iconSmall: {
      fontSize: 20
    }
  });

const onDrop = (
  acceptedFiles: any[],
  rejectedFiles: any[],
  addImagesFunc: typeof addImages,
  showMessageFunc: typeof showMessage
) => {
  /*
lastModified: 1541910129972
lastModifiedDate: Sun Nov 11 2018 12:22:09 GMT+0800 (香港標準時間) {}
name: "Stuart.jpg"
size: 173149
type: "image/jpeg"
webkitRelativePath: ""
__proto__: File
*/
  if (!!(acceptedFiles || []).length) {
    addImagesFunc(
      acceptedFiles.map(image => ({
        ...image,
        preview: URL.createObjectURL(image)
      }))
    );
  }
  const rejectedMessage = (rejectedFiles || [])
    .map(file => file.name)
    .join('\n');
  if (!!rejectedMessage) {
    showMessageFunc(`The following files are not images
${rejectedMessage}`);
  }
};
/*
Prop name	Type	Default	Description
accept	union		
Allow specific types of files. See https://github.com/okonet/attr-accept for more information. Keep in mind that mime type determination is not reliable across platforms. CSV files, for example, are reported as text/plain under macOS but as application/vnd.ms-excel under Windows. In some cases there might not be a mime type set at all. See: https://github.com/react-dropzone/react-dropzone/issues/276

One of type: string, string[]
acceptClassName	string		
className to apply when drop will be accepted

acceptStyle	object		
CSS styles to apply when drop will be accepted

activeClassName	string		
className to apply when drag is active

activeStyle	object		
CSS styles to apply when drag is active

children	union		
Contents of the dropzone

One of type: node, func
className	string		
className

disableClick	bool	false	
Disallow clicking on the dropzone container to open file dialog

disabled	bool	false	
Enable/disable the dropzone entirely

disabledClassName	string		
className to apply when dropzone is disabled

disabledStyle	object		
CSS styles to apply when dropzone is disabled

getDataTransferItems	func	Function	
getDataTransferItems handler

Arguments
event: Event
Returns Array — array of File objects
inputProps	object	Shape	
Pass additional attributes to the <input type="file"/> tag

maxSize	number	Infinity	
Maximum file size (in bytes)

minSize	number	0	
Minimum file size (in bytes)

multiple	bool	true	
Allow dropping multiple files

name	string		
name attribute for the input tag

onClick	func		
onClick callback

Arguments
event: Event
onDragEnter	func		
onDragEnter callback

onDragLeave	func		
onDragLeave callback

onDragOver	func		
onDragOver callback

onDragStart	func		
onDragStart callback

onDrop	func		
onDrop callback

onDropAccepted	func		
onDropAccepted callback

onDropRejected	func		
onDropRejected callback

onFileDialogCancel	func		
Provide a callback on clicking the cancel button of the file dialog

preventDropOnDocument	bool	true	
If false, allow dropped items to take over the current browser window

rejectClassName	string		
className to apply when drop will be rejected

rejectStyle	object		
CSS styles to apply when drop will be rejected

style	object		
CSS styles to apply

Method name	Parameters	Description
open()		
Open system file upload dialog.
*/
const DropzoneComponent = ({ classes, images, addImages, showMessage }) => (
  <React.Fragment>
    <Dropzone
      accept="image/jpeg, image/png"
      onDrop={(acceptedFiles, rejectedFiles) =>
        onDrop(acceptedFiles, rejectedFiles, addImages, showMessage)
      }
      className="color-bg"
      style={{
        borderWidth: 5,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.2)',
        borderRadius: 5,
        width: 640,
        height: 480,
        alignContent: 'center',
        justifyContent: 'center',
        flexFlow: 'row wrap',
        display: 'flex'
      }}
    >
      <Typography variant="h4" gutterBottom className={classes.typography}>
        Drop your file here...
      </Typography>
      <div className={classes.br} />
      <Button variant="contained" color="secondary" className={classes.button}>
        Browse...
        <Collections />
      </Button>
    </Dropzone>
  </React.Fragment>
);

const camPanelSelector = ({ message }) => ({
  message
});

const mapStateToProps = ({ camPanel }: AppState) => camPanelSelector(camPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addImages: images => dispatch(addImages(images)),
  showMessage: message => dispatch(showMessage(message))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DropzoneComponent));
