import clsx from "clsx";
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

  return (
    <div
      style={{
        height: targetHeight,
        width: portrait
          ? Math.floor((image.height / image.width) * targetHeight)
          : Math.floor((image.width / image.height) * targetHeight),
      }}
    >
      <img
        onClick={onClick}
        className={clsx("absolute", className)}
        style={style}
        src={`${configData.API_URL}/images/${image.id}/${version}`}
        alt=""
      />
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
};
