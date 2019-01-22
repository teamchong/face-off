import { Button, Typography } from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Collections } from '@material-ui/icons';
import { createObjectURL } from 'blob-util';
import * as React from 'react';
import { Fragment, ReactElement, ReactType } from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector } from 'reselect';
import {
  addImages,
  fetchMp4Url,
  showMessage,
  switchTab,
} from '../actions/FaceOffActions';
import { readAsImage } from '../classes/fileApi';
import { MAX_HEIGHT, MAX_WIDTH } from '../constants';
import { IFaceOffModel, IRootState } from '../models';

const styles = () =>
  createStyles({
    br: {
      width: '100%',
    },
    colorBg: {
      animation: 'Gradient 15s ease infinite',
      background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      backgroundSize: '400% 400%',
      color: '#fff',
    },
    iconSmall: {
      fontSize: 20,
    },
    overlay: {
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 1,
    },
    typography: {
      color: 'rgba(255,255,255,0.9)',
    },
  });

const faceOffPanelSelector = ({ message }: IFaceOffModel) => ({
  message,
});

const mapStateToProps = ({ faceOffPanel }: IRootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dropHandler: async (acceptedFiles: File[], rejectedFiles: File[]) => {
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
      const imageFiles: HTMLImageElement[] = [];
      const videoFiles: string[] = [];
      for (let i = 0, iL = acceptedFiles.length; i < iL; i++) {
        const file = acceptedFiles[i];

        if (!file) {
          continue;
        }
        if (/^video\/(?:mp4|webm)$/i.test(file.type)) {
          videoFiles.push(createObjectURL(file));
        } else if (/^image\/.+$/i.test(file.type)) {
          imageFiles.push(await readAsImage(file));
        }
      }
      if (imageFiles.length) {
        dispatch(addImages(imageFiles));
      }
      if (videoFiles.length) {
        dispatch(fetchMp4Url(videoFiles[videoFiles.length - 1]));
        dispatch(switchTab('one'));
      }
    }
    const rejectedMessage = (rejectedFiles || [])
      .map(file => file.name)
      .join('\n');
    if (!!rejectedMessage) {
      dispatch(
        showMessage(`The following files are not images
${rejectedMessage}`)
      );
    }
  },
});

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
const DropzoneComponent = ({
  classes,
  dropHandler,
}: StyledComponentProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>) => (
  <Dropzone
    accept="image/*, video/mp4, video/webm"
    onDrop={dropHandler}
    className={classes!.colorBg}
    style={{
      alignContent: 'center',
      borderColor: 'rgba(0,0,0,0.2)',
      borderRadius: 5,
      borderStyle: 'dashed',
      borderWidth: 5,
      display: 'flex',
      flexFlow: 'row wrap',
      height: MAX_HEIGHT,
      justifyContent: 'center',
      width: MAX_WIDTH,
    }}
  >
    <Typography
      variant="h4"
      gutterBottom={true}
      className={classes!.typography}
    >
      Drop your images/video here...
    </Typography>
    <div className={classes!.br} />
    <Button variant="contained" color="secondary" className={classes!.button}>
      Browse...
      <Collections />
    </Button>
  </Dropzone>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DropzoneComponent));
