import { Image } from "@/models/image";
import React, { ReactElement } from "react";
import { ImageView } from "./ImageView";
import classes from "./ImageThumbnail.module.css";

interface Props {
  image: Image;
  onClick?: (imageId: string) => void;
}

const TARGET_HEIGHT = 80;

const ImageThumbnail = ({ image, onClick }: Props): ReactElement => {
  return (
    <ImageView
      className={classes.thumb}
      image={image}
      targetHeight={TARGET_HEIGHT}
      onClick={() => onClick?.(image.id)}
      version="sm"
    />
  );
};

export default ImageThumbnail;
