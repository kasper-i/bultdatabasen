import { Image } from "@/models/image";
import React, { ReactElement } from "react";
import { ImageView } from "./ImageView";

interface Props {
  image: Image;
  onClick?: (imageId: string) => void;
}

const TARGET_HEIGHT = 80;

const ImageThumbnail = ({ image, onClick }: Props): ReactElement => {
  return (
    <ImageView
      image={image}
      targetHeight={TARGET_HEIGHT}
      className="rounded-sm cursor-pointer ring-2 ring-gray-200 hover:ring-2 hover:ring-primary-500 ring-offset-2"
      onClick={() => onClick?.(image.id)}
      version="sm"
    ></ImageView>
  );
};

export default ImageThumbnail;
