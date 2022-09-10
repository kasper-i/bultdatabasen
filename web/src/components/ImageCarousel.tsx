import configData from "@/config.json";
import { Image, ImageRotation, ImageVersion } from "@/models/image";
import { useDeleteImage, useUpdateImage } from "@/queries/imageQueries";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import React, {
  CSSProperties,
  FC,
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import Button from "./atoms/Button";
import IconButton from "./atoms/IconButton";
import Spinner from "./atoms/Spinner";
import ConfirmedDeleteButton from "./molecules/ConfirmedDeleteButton";
import Restricted from "./Restricted";

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
    maxHeight: "calc(100vh - 4rem)",
    maxWidth: "calc(100vw)",
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
    <Transition appear show as={Fragment}>
      <Dialog className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen flex flex-col justify-center items-center overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            entered="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-neutral-50" />
          </Transition.Child>

          {loading && (
            <div className="fixed flex items-center justify-center -mt-16">
              <Spinner active={loading} />
            </div>
          )}

          <div className="-mt-16" tabIndex={1}>
            <img
              className={clsx(loading && "invisible")}
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

          <div className="fixed h-16 w-full bottom-0 inset-x-0 flex justify-between px-5 bg-neutral-100">
            <IconButton tiny onClick={onClose} icon="back" />
            <div className="flex items-center gap-2.5">
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
                  icon="refresh"
                  className="ring-offset-neutral-100"
                >
                  Rotera
                </Button>
              </Restricted>

              <Button
                loading={updateImage.isLoading}
                onClick={() =>
                  (window.location.href = `${configData.API_URL}/images/${image.id}/original`)
                }
                icon="download"
                className="ring-offset-neutral-100"
              >
                Original
              </Button>
              <Restricted>
                <ConfirmedDeleteButton target="bilden" mutation={deleteImage} />
              </Restricted>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
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
