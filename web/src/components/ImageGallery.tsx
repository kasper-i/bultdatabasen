import { Image } from "@/models/image";
import { PhotographIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import moment from "moment";
import React, { Fragment, useMemo, useState } from "react";
import { ImageCarousel } from "./ImageCarousel";
import ImageThumbnail from "./ImageThumbnail";

interface Props {
  images: Image[];
  pointId: string;
  locked: boolean;
  className?: string;
}

const ImageGallery = ({ images, pointId, locked, className }: Props) => {
  const [currImg, setCurrImg] = useState<string>();

  const imagesByYear = useMemo(() => {
    const lookup: Map<number, Image[]> = new Map();

    if (images !== undefined) {
      for (const image of images) {
        const timestamp = moment(image.timestamp);
        const year: number = timestamp.year();

        let images = lookup.get(year);
        if (images === undefined) {
          images = [];
          lookup.set(year, images);
        }

        images.push(image);
      }
    }

    return lookup;
  }, [images]);

  const years = Array.from(imagesByYear.keys());

  years.sort().reverse();

  if (images.length === 0) {
    return <Fragment />;
  }

  return (
    <div className={clsx("w-full flex flex-col", className)}>
      {years.map((year) => (
        <div key={year}>
          <p className="flex items-center gap-1 my-1.5 text-primary-500">
            <PhotographIcon className="text-primary-500 h-5" />
            {year}
          </p>
          <div className="ml-6 flex flex-wrap gap-3">
            {imagesByYear.get(year)?.map((image) => (
              <ImageThumbnail
                key={image.id}
                pointId={pointId}
                image={image}
                onClick={() => setCurrImg(image.id)}
                locked={!locked}
              />
            ))}
          </div>
        </div>
      ))}
      {currImg !== undefined && (
        <ImageCarousel
          selectedImageId={currImg}
          images={images ?? []}
          onClose={() => setCurrImg(undefined)}
        />
      )}
    </div>
  );
};

export default ImageGallery;
