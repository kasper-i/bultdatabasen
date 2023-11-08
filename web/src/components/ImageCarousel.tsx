import configData from "@/config.json";
import { Image, ImageRotation, ImageVersion } from "@/models/image";
import { useDeleteImage, useUpdateImage } from "@/queries/imageQueries";
import { ActionIcon, Button, Group, Loader } from "@mantine/core";
import { IconDownload, IconRotateClockwise2, IconX } from "@tabler/icons-react";
import {
  CSSProperties,
  FC,
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import classes from "./ImageCarousel.module.css";
import Restricted from "./Restricted";
import ConfirmedDeleteButton from "./molecules/ConfirmedDeleteButton";

type Orientation = "portrait" | "landscape";

export const FullSizeImage: FC<{
  image: Image;
  pointId: string;
  onClose: () => void;
  version: ImageVersion;
}> = ({ image, pointId, onClose, version }) => {
  const updateImage = useUpdateImage(pointId, image.id);
  const deleteImage = useDeleteImage(pointId, image.id);

  const imgRef = useRef<HTMLImageElement>(null);
  const loading = !(imgRef.current?.complete ?? false);

  useEffect(() => {
    if (deleteImage.isSuccess) {
      onClose();
    }
  }, [deleteImage.isSuccess]);

  const [, forceRender] = useReducer((s) => s + 1, 0);

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
      rotatorClasses = {
        transform: "rotate(0deg) ",
      };
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

  const onLoad = () => {
    forceRender();
  };

  let dimensionClasses: CSSProperties = {
    maxHeight: "round(up, calc(100vh - 3.5rem), 1px)",
    maxWidth: "round(up, calc(100vw), 1px)",
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
    <div className={classes.modal}>
      {loading && (
        <div className={classes.loaderContainer}>
          <Loader type="bars" />
        </div>
      )}
      <div className={classes.imgContainer} tabIndex={1}>
        <img
          ref={imgRef}
          onLoad={onLoad}
          style={{
            visibility: loading ? "hidden" : "visible",
            ...dimensionClasses,
            ...rotatorClasses,
          }}
          src={`${configData.API_URL}/images/${image.id}/${version}`}
          alt=""
        />
      </div>
      <Group gap="sm" justify="space-between" className={classes.toolbar}>
        <ActionIcon
          onClick={onClose}
          variant="subtle"
          className={classes.filler}
        >
          <IconX size={14} />
        </ActionIcon>
        <Restricted>
          <Button
            loading={updateImage.isLoading}
            onClick={() =>
              updateImage.mutate({
                rotation: image.rotation
                  ? (((image.rotation + 90) % 360) as ImageRotation)
                  : 90,
              })
            }
            leftSection={<IconRotateClockwise2 size={14} />}
          >
            Rotera
          </Button>
        </Restricted>

        <Button
          loading={updateImage.isLoading}
          onClick={() =>
            (window.location.href = `${configData.API_URL}/images/${image.id}`)
          }
          leftSection={<IconDownload size={14} />}
        >
          Original
        </Button>
        <Restricted>
          <ConfirmedDeleteButton target="bilden" mutation={deleteImage} />
        </Restricted>
      </Group>
    </div>
  );
};

export const ImageCarousel: FC<{
  pointId: string;
  images: Image[];
  selectedImageId: string;
  onClose: () => void;
}> = ({ pointId, images, selectedImageId, onClose }) => {
  const [index, setIndex] = useState(
    images.findIndex((image) => image.id === selectedImageId)
  );

  const prev = () =>
    setIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  const next = () => setIndex((index) => (index + 1) % images.length);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prev();
      } else if (event.key === "ArrowRight") {
        next();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (index === undefined || images[index] === undefined) {
    return <Fragment />;
  }

  return (
    <FullSizeImage
      pointId={pointId}
      image={images[index]}
      version="xl"
      onClose={onClose}
    />
  );
};
