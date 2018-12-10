import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import * as React from 'react';
import { ReactElement } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { removeImages } from '../actions/FaceOffActions';
import { FaceOffModel, RootState } from '../models';

type ImageCardProps = {
  index: number;
};

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    overlay: {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 1,
    },
    title: {
      position: 'absolute',
      color: '#fff',
      textShadow: '1px 1px #000',
    },
    card: {
      margin: '5px',
      display: 'inline-block',
    },
    cardActions: {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
  });

const faceOffPanelSelector = ({ images, imagesOverlayRef }: FaceOffModel) => ({
  images,
  imagesOverlayRef,
});

const mapStateToProps = ({ faceOffPanel }: RootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  removeImages: (imageIndexes: number[]) =>
    dispatch(removeImages(imageIndexes)),
});

const mergeProps = (stateProps, dispatchProps, ownProps: ImageCardProps) => {
  const { index } = ownProps;
  const { images, imagesOverlayRef } = stateProps;
  const { removeImages } = dispatchProps;
  const image = images[index] || ({} as any);
  const { id, title, width, height, src } = image;
  const imageOverlayRef = imagesOverlayRef[id];
  const removeImageHandler = () => removeImages([index]);
  return {
    index,
    id,
    title,
    width,
    height,
    src,
    images,
    imageOverlayRef,
    removeImageHandler,
  };
};

const ImageCard = ({
  classes,
  index,
  id,
  title,
  width,
  height,
  src,
  images,
  imageOverlayRef,
  removeImageHandler,
}: StyledComponentProps & ReturnType<typeof mergeProps>): ReactElement<any> => (
  <Card className={classes!.card} style={{ order: images.length - index }}>
    <CardActionArea>
      <CardContent className={classes!.title}>{name}</CardContent>
      <canvas
        ref={imageOverlayRef}
        width={width}
        height={height}
        className={classes!.overlay}
      />
      <img
        src={src}
        title={title}
        width={width}
        height={height}
        className={classes!.card}
      />
    </CardActionArea>
    <CardActions className={classes!.cardActions}>
      <Button size="small" color="primary" onClick={removeImageHandler}>
        <Delete /> Remove
      </Button>
    </CardActions>
  </Card>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withStyles(styles)(ImageCard));
