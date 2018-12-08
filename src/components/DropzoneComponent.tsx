import { Button, Typography } from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { canvasToBlob, createObjectURL, revokeObjectURL } from 'blob-util';
import { Collections } from '@material-ui/icons';
import * as React from 'react';
import { Fragment, ReactElement, ReactType } from 'react';
import * as DropzoneType from 'react-dropzone';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { addImages, showMessage,fetchMp4Url } from '../actions/FaceOffActions';
import { FaceOffModel } from '../models';
import { RootState } from '../reducers';

const Dropzone: ReactType = DropzoneType as any;
const MAX_WIDTH = 640;

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
type Actions = {
  addImages: typeof addImages;
  showMessage: typeof showMessage;
  fetchMp4Url: typeof fetchMp4Url;
};
type DropzoneComponentProps = StyledComponentProps &
  Actions &
  Partial<FaceOffModel>;
const DropzoneComponent = ({
  classes,
  addImages,
  showMessage,
  fetchMp4Url,
}: DropzoneComponentProps) => {
  const readAsImage = async (file: File): Promise<HTMLImageElement> => {
    const dataUrl = createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const imgEl = new Image();
      imgEl.title = file.name;
      imgEl.onload = () => resolve(imgEl);
      imgEl.onerror = error => reject(error);
      imgEl.src = dataUrl;
    });
    if (img.width > MAX_WIDTH) {
      const newHeight = ~~((MAX_WIDTH * img.height) / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = MAX_WIDTH;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (ctx !== null) {
        ctx.drawImage(img, 0, 0, MAX_WIDTH, newHeight);
        const src = createObjectURL(
          await canvasToBlob(ctx.canvas, 'image/png')
        );
        return await new Promise<HTMLImageElement>((resolve, reject) => {
          const imgEl = new Image();
          imgEl.title = file.name;
          imgEl.onload = () => resolve(imgEl);
          imgEl.onerror = error => reject(error);
          imgEl.src = src;
          revokeObjectURL(dataUrl);
        });
      }
    }
    return img;
  };
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
          videoFiles.push(file);
        } else {
          imageFiles.push(file);
        }
      }
      if (imageFiles.length) {
        addImages(
          await Promise.all(imageFiles.map(image => readAsImage(image)))
        );
      }
      if (videoFiles.length) {
        fetchMp4Url
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
        width: 640,
        height: 480,
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

const faceOffPanelSelector = ({ message }: FaceOffModel) => ({
  message,
});

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addImages: (images: HTMLImageElement[]) => dispatch(addImages(images)),
  showMessage: (message: string) => dispatch(showMessage(message)),
  fetchMp4Url: (youtubeUrl: string) => dispatch(fetchMp4Url(youtubeUrl));
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DropzoneComponent));
