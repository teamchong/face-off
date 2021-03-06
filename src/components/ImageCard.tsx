import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CircularProgress,
} from '@material-ui/core';
import {
  createStyles,
  StyledComponentProps,
  withStyles,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { Delete } from '@material-ui/icons';
import * as React from 'react';
import { ReactElement } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { removeImages } from '../actions/FaceOffActions';
import { IFaceOffModel, IRootState } from '../models';

interface IImageCardProps {
  index: number;
}

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    card: {
      display: 'inline-block',
      margin: '5px',
    },
    cardActions: {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    overlay: {
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 1,
    },
    overlayImage: {
      display: 'block',
    },
    title: {
      color: '#fff',
      position: 'absolute',
      textShadow: '1px 1px #000',
    },
  });

const faceOffPanelSelector = ({ images, imagesOverlaies }: IFaceOffModel) => ({
  images,
  imagesOverlaies,
});

const mapStateToProps = ({ faceOffPanel }: IRootState) =>
  faceOffPanelSelector(faceOffPanel);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  removingImages: (imageIndexes: number[]) =>
    dispatch(removeImages(imageIndexes)),
});

const mergeProps = (stateProps, dispatchProps, ownProps: IImageCardProps) => {
  const { index } = ownProps;
  const { images, imagesOverlaies } = stateProps;
  const { removingImages } = dispatchProps;
  const image = images[index] || ({} as any);
  const { id, title, width, height, src } = image;
  const imagesOverlay = /^blob:/i.test(imagesOverlaies[id])
    ? imagesOverlaies[id]
    : '';
  const removeImageHandler = () => removingImages([index]);
  return {
    height,
    id,
    images,
    imagesOverlay,
    index,
    removeImageHandler,
    src,
    title,
    width,
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
  imagesOverlay,
  removeImageHandler,
}: StyledComponentProps & ReturnType<typeof mergeProps>): ReactElement<any> => (
  <Card className={classes!.card} style={{ order: images.length - index }}>
    <div>
      {!!title && <div className={classes!.title}>{title}</div>}
      <div className={classes!.overlay}>
        {imagesOverlay ? (
          <img
            src={imagesOverlay}
            width={width}
            height={height}
            className={classes!.overlayImage}
          />
        ) : (
          <CircularProgress size={12} className={classes!.alignCenter} />
        )}
      </div>
      <img
        src={src}
        title={title}
        width={width}
        height={height}
        className={classes!.card}
      />
    </div>
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
