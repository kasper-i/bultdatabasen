import configData from "@/config.json";
import { Image, ImageVersion } from "@/models/image";
import { Loader } from "@mantine/core";
import clsx from "clsx";
import { CSSProperties, ReactNode, useReducer, useRef } from "react";

interface Props {
  image: Image;
  targetHeight: number;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  version: ImageVersion;
}

type Orientation = "portrait" | "landscape";

export const ImageView = ({
  image,
  targetHeight,
  className,
  onClick,
  children,
  version,
}: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const loading = !(imgRef.current?.complete ?? false);

  const [, forceRender] = useReducer((s) => s + 1, 0);

  let rotatorClasses: CSSProperties = {};
  let innerStyle: CSSProperties = {};

  const originalOrientation: Orientation =
    image.height > image.width ? "portrait" : "landscape";
  const targetOrientation =
    (image.rotation ?? 0) % 180 === 0
      ? originalOrientation
      : originalOrientation === "portrait"
      ? "landscape"
      : "portrait";

  switch (image.rotation) {
    case 0:
      break;
    case 90:
      rotatorClasses = {
        transform: "rotate(90deg) translateY(-100%)",
        transformOrigin: "left top",
      };
      break;
    case 180:
      rotatorClasses = {
        transform: "rotate(180deg) translateX(-100%) translateY(-100%)",
        transformOrigin: "left top",
      };
      break;
    case 270:
      rotatorClasses = {
        transform: "rotate(-90deg) translateX(-100%)",
        transformOrigin: "left top",
      };
      break;
  }

  let width = 0;
  if (targetOrientation === originalOrientation) {
    width = (image.width / image.height) * targetHeight;
  } else {
    width = (image.height / image.width) * targetHeight;
  }

  if (targetOrientation === originalOrientation) {
    innerStyle = {
      height: targetHeight,
      width: width,
    };
  } else {
    innerStyle = {
      height: width,
      width: targetHeight,
    };
  }

  const onLoad = () => {
    forceRender();
  };

  return (
    <div
      data-tailwind="relative"
      style={{
        height: targetHeight,
        width: width,
      }}
    >
      <div data-tailwind="absolute inset-0 flex justify-center items-center">
        {loading && <Loader type="bars" />}
      </div>
      <div data-tailwind="absolute" style={innerStyle}>
        <img
          ref={imgRef}
          onLoad={onLoad}
          onClick={onClick}
          className={className}
          data-tailwind="h-full w-full object-contain"
          style={{ imageOrientation: "none", ...rotatorClasses }}
          src={`${configData.API_URL}/images/${image.id}/${version}`}
          alt=""
        />
      </div>
      {children}
    </div>
  );
};
