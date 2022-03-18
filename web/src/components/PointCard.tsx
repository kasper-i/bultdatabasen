import { BoltType } from "@/models/bolt";
import { Image } from "@/models/image";
import { Point } from "@/models/point";
import { useBolts, useCreateBolt } from "@/queries/boltQueries";
import { useImages } from "@/queries/imageQueries";
import { useDetachPoint } from "@/queries/pointQueries";
import { copy } from "@/slices/clipboardSlice";
import { useAppDispatch } from "@/store";
import { translateBoltType } from "@/utils/boltUtils";
import moment from "moment";
import React, { Fragment, ReactElement, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./base/Button";
import IconButton from "./base/IconButton";
import Loader from "./base/Loader";
import BoltDetails from "./BoltDetails";
import { ImageCarousel } from "./ImageCarousel";
import ImageDropzone from "./ImageDropzone";
import ImageThumbnail from "./ImageThumbnail";
import Restricted from "./Restricted";

interface Props {
  point: Point;
  routeId: string;
}

function PointCard({ point, routeId }: Props): ReactElement {
  const navigate = useNavigate();
  const createBolt = useCreateBolt(routeId, point.id);
  const deletePoint = useDetachPoint(routeId, point.id);
  const images = useImages(point.id);
  const bolts = useBolts(point.id);
  const dispatch = useAppDispatch();

  const [currImg, setCurrImg] = useState<string>();
  const [imagesLocked, setImagesLocked] = useState(false);
  const [selectedBoltType, setSelectedBoltType] =
    useState<BoltType>("expansion");

  const imagesByYear = useMemo(() => {
    const lookup: Map<number, Image[]> = new Map();

    if (images.data !== undefined) {
      for (const image of images.data) {
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

  const sharedParents = point.parents.filter((parent) => parent.id !== routeId);

  const allowDelete =
    sharedParents.length > 0 ||
    (bolts.data?.length === 0 && images.data?.length === 0);

  const renderImages = () => {
    const years = Array.from(imagesByYear.keys());

    years.sort().reverse();

    return (
      <div className="w-full flex flex-wrap gap-3 pt-2.5">
        <>
          {years.map((year) => (
            <Fragment key={"year-" + year}>
              {imagesByYear.get(year)?.map((image) => (
                <ImageThumbnail
                  key={image.id}
                  pointId={point.id}
                  image={image}
                  onClick={() => setCurrImg(image.id)}
                  locked={!imagesLocked}
                />
              ))}
            </Fragment>
          ))}
          <Restricted>
            <ImageDropzone key="new" pointId={point.id} />
          </Restricted>
        </>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start p-4">
      <div className="flex justify-between w-full items-start">
        <div>
          <span className="text-4xl font-bold">#{point.number}</span>

          {sharedParents.length > 0 && (
            <div className="flex space-x-1">
              <span className="whitespace-nowrap">Delad med</span>
              <div className="flex space-x-1">
                {sharedParents.map((parent) => (
                  <span
                    key={point.id}
                    className="underline cursor-pointer"
                    onClick={() => {
                      navigate({
                        pathname: `/route/${parent.id}`,
                        search: `?p=${point.id}`,
                      });
                    }}
                  >
                    {parent.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Restricted>
          <div className="flex gap-2">
            <IconButton
              onClick={() => dispatch(copy({ pointId: point.id }))}
              icon="copy"
            />
            <IconButton
              loading={deletePoint.isLoading}
              onClick={() => deletePoint.mutate()}
              icon="trash"
              color="danger"
              disabled={!allowDelete}
            />
          </div>
        </Restricted>
      </div>

      <p className="pt-2">{`${bolts.data?.length} bultar`}</p>
      <div className="flex flex-wrap gap-5 py-5">
        {bolts.data?.map((bolt) => (
          <BoltDetails
            routeId={routeId}
            pointId={point.id}
            key={bolt.id}
            bolt={bolt}
          />
        ))}
        <Restricted>
          <div key="new" className="">
            <Button
              className="flex-shrink-0"
              loading={createBolt.isLoading}
              onClick={() => createBolt.mutate({ type: selectedBoltType })}
              icon="add"
            >
              {translateBoltType(selectedBoltType)}
            </Button>
          </div>
        </Restricted>
      </div>

      <div className="flex items-center w-full py-2.5">
        <h5 className="font-bold text-2xl pr-2">Bilder</h5>
        <Restricted>
          <IconButton
            onClick={() => setImagesLocked((checked) => !checked)}
            icon={imagesLocked ? "unlock" : "lock"}
          />
        </Restricted>
      </div>
      {images.data?.length === 0 && (
        <p className="italic text-gray-600">Här saknas det bilder.</p>
      )}
      {images.isLoading ? (
        <Loader />
      ) : (
        <>
          {renderImages()}
          {currImg !== undefined && (
            <ImageCarousel
              selectedImageId={currImg}
              images={images.data ?? []}
              onClose={() => setCurrImg(undefined)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default PointCard;
