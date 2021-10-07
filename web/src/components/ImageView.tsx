import configData from "config.json";
import { Image, ImageVersion } from "models/image";
import React, { CSSProperties, ReactNode } from "react";

interface Props {
  image: Image;
  targetHeight: number;
  className: string;
  onClick?: () => void;
  children?: ReactNode;
  version: ImageVersion;
}

export const ImageView = ({
  image,
  targetHeight,
  className,
  onClick,
  children,
  version,
}: Props) => {
  let style: CSSProperties = {};
  const portrait = (image.rotation ?? 0) % 180 === 90;

  switch (image.rotation) {
    case 0:
      break;
    case 90:
      style = {
        transform: "rotate(90deg) translateY(-100%)",
        transformOrigin: "left top",
      };
      break;
    case 180:
      style = {
        transform: "rotate(180deg) translateX(-100%) translateY(-100%)",
        transformOrigin: "left top",
      };
      break;
    case 270:
      style = {
        transform: "rotate(-90deg) translateX(-100%)",
        transformOrigin: "left top",
      };
      break;
  }

  if (portrait) {
    style = { ...style, width: `${targetHeight}px`, height: "auto" };
  } else {
    style = { ...style, height: `${targetHeight}px`, width: "auto" };
  }

  const ratio = image.width / image.height;
  const width = portrait
    ? Math.floor((1 / ratio) * targetHeight)
    : Math.floor(ratio * targetHeight);

  return (
    <div
      className="relative"
      style={{
        height: targetHeight,
        width: width,
      }}
    >
      <div className="absolute">
        <img
          onClick={onClick}
          className={className}
          style={style}
          src={`${configData.API_URL}/images/${image.id}/${version}`}
          alt=""
        />
      </div>
      {children}
    </div>
  );
};
