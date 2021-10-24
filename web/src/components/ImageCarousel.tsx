import configData from "config.json";
import { Image, ImageVersion } from "models/image";
import React, {
  CSSProperties,
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useKey } from "react-use";
import { Icon, Loader } from "semantic-ui-react";

interface FullSizeImageProps {
  image: Image;
  onClose?: () => void;
  version: ImageVersion;
}

type Orientation = "portrait" | "landscape";

export const FullSizeImage = ({
  image,
  onClose,
  version,
}: FullSizeImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const loading = !(imgRef.current?.complete ?? false);

  const [, forceRender] = useReducer((s) => s + 1, 0);

  useKey("Escape", onClose);

  useEffect(() => {
    var body = document.body;
    body?.classList.add("no-scroll");

    return () => {
      var body = document.body;
      body?.classList.remove("no-scroll");
    };
  });

  let rotatorClasses: CSSProperties = {};

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
        transform: "rotate(90deg) ",
      };
      break;
    case 180:
      rotatorClasses = {
        transform: "rotate(180deg)",
      };
      break;
    case 270:
      rotatorClasses = {
        transform: "rotate(-90deg)",
      };
      break;
  }

  const onLoad = (_event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    forceRender();
  };

  let dimensionClasses: CSSProperties = {
    maxHeight: "calc(100vh - 140px)",
    maxWidth: "calc(100vw - 40px)",
  };

  if (targetOrientation !== originalOrientation) {
    const { maxHeight, maxWidth } = dimensionClasses;

    dimensionClasses = {
      ...dimensionClasses,
      maxHeight: maxWidth,
      maxWidth: maxHeight,
    };
  }

  return (
    <div>
      <Icon
        className="fixed top-5 right-5 text-white"
        size="big"
        onClick={onClose}
        name="close"
      />

      <Loader active={loading} size="big" />
      <img
        ref={imgRef}
        onLoad={onLoad}
        style={{
          imageOrientation: "none",
          ...dimensionClasses,
          ...rotatorClasses,
        }}
        src={`${configData.API_URL}/images/${image.id}/${version}`}
        alt=""
      />
    </div>
  );
};

interface ImageCarouselProps {
  images: Image[];
  selectedImageId: string;
  onClose: () => void;
}

export const ImageCarousel = ({
  images,
  selectedImageId,
  onClose,
}: ImageCarouselProps) => {
  const [index, setIndex] = useState(
    images.findIndex((image) => image.id === selectedImageId)
  );

  const prev = () =>
    setIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  const next = () => setIndex((index) => (index + 1) % images.length);

  useKey("ArrowLeft", prev);
  useKey("ArrowRight", next);

  if (index === undefined) {
    return <Fragment />;
  }

  return (
    <>
      <div className="fixed top-0 left-0 h-screen w-screen bg-black opacity-80"></div>
      <div className="fixed top-0 left-0 h-screen w-screen flex justify-center items-center">
        <FullSizeImage image={images[index]} version="xl" onClose={onClose} />
      </div>
    </>
  );
};
