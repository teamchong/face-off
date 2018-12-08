import { Button, Typography } from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { createObjectURL } from 'blob-util';
import { Collections } from '@material-ui/icons';
import * as React from 'react';
import { Fragment, ReactElement, ReactType } from 'react';
import * as DropzoneType from 'react-dropzone';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector } from 'reselect';
import {
  addImages,
  showMessage,
  fetchMp4Url,
  switchTab,
} from '../actions/FaceOffActions';
import { MAX_WIDTH, MAX_HEIGHT } from '../constants';
import { FaceOffModel } from '../models';
import { readAsImage, RootState } from '../reducers';

const Dropzone: ReactType = DropzoneType as any;

const styles = () =>
  createStyles({
    typography: {
      color: 'rgba(255,255,255,0.9)',
    },
    br: {
      width: '100%',
    },
    iconSmall: {
      fontSize: 20,
    },
    overlay: {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1,
    },
  });

const faceOffPanelSelector = ({ message }: FaceOffModel) => ({
  message,
});

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addImages: (images: HTMLImageElement[]) => dispatch(addImages(images)),
  showMessage: (message: string) => dispatch(showMessage(message)),
  fetchMp4Url: (videoUrl: string) => dispatch(fetchMp4Url(videoUrl)),
  switchTab: (tab: string) => dispatch(switchTab(tab)),
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
  addImages,
  showMessage,
  fetchMp4Url,
  switchTab,
}: StyledComponentProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>) => {
  const dropHandler = async (acceptedFiles: File[], rejectedFiles: File[]) => {
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
      const imageFiles = [];
      const videoFiles = [];
      for (let i = 0, iL = acceptedFiles.length; i < iL; i++) {
        const file = acceptedFiles[i];

        if (file.type === 'video/mp4') {
          videoFiles.push(createObjectURL(file));
        } else {
          imageFiles.push(await readAsImage(file));
        }
      }
      if (imageFiles.length) {
        addImages(imageFiles);
      }
      if (videoFiles.length) {
        fetchMp4Url(videoFiles[videoFiles.length - 1]);
        switchTab('one');
      }
    }
    const rejectedMessage = (rejectedFiles || [])
      .map(file => file.name)
      .join('\n');
    if (!!rejectedMessage) {
      showMessage(`The following files are not images
${rejectedMessage}`);
    }
  };
  return (
    <Dropzone
      accept="image/jpeg, image/png, video/mp4"
      onDrop={dropHandler}
      className="color-bg"
      style={{
        borderWidth: 5,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.2)',
        borderRadius: 5,
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        alignContent: 'center',
        justifyContent: 'center',
        flexFlow: 'row wrap',
        display: 'flex',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom={true}
        className={classes!.typography}
      >
        Drop your file here...
      </Typography>
      <div className={classes!.br} />
      <Button variant="contained" color="secondary" className={classes!.button}>
        Browse...
        <Collections />
      </Button>
    </Dropzone>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DropzoneComponent));
