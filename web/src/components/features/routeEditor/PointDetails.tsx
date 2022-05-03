import Loader from "@/components/atoms/Loader";
import { Concatenator } from "@/components/Concatenator";
import BoltDetails from "@/components/features/routeEditor/BoltDetails";
import Feed from "@/components/Feed";
import { ImageCarousel } from "@/components/ImageCarousel";
import ImageThumbnail from "@/components/ImageThumbnail";
import ImageUploadButton from "@/components/ImageUploadButton";
import ConfirmedDeleteButton from "@/components/molecules/ConfirmedDeleteButton";
import Restricted from "@/components/Restricted";
import { Bolt } from "@/models/bolt";
import { Point } from "@/models/point";
import { useBolts } from "@/queries/boltQueries";
import { useImages } from "@/queries/imageQueries";
import { useDetachPoint } from "@/queries/pointQueries";
import { compareDesc } from "date-fns";
import React, { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import { PointLabel } from "./hooks";

interface Props {
  point: Point;
  routeId: string;
  label: PointLabel;
  onClose: () => void;
}

function PointDetails({ point, routeId, label, onClose }: Props): ReactElement {
  const deletePoint = useDetachPoint(routeId, point.id);
  const { data: images } = useImages(point.id);
  const bolts = useBolts(point.id);
  const [currImg, setCurrImg] = useState<string>();

  const sharedParents = point.parents.filter((parent) => parent.id !== routeId);

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div className="h-6">
            <p className="cursor-pointer" onClick={onClose}>
              {label.name}
              <span className="font-medium text-primary-600 ml-1">
                #{label.no}
              </span>
            </p>
          </div>

          <div className="space-x-1 text-xs">
            {sharedParents.length === 0
              ? "Delas ej med annan led."
              : sharedParents.length > 0 && (
                  <>
                    <span className="whitespace-nowrap">Delas med</span>
                    <span>
                      <Concatenator>
                        {sharedParents.map((parent) => (
                          <Link
                            key={point.id}
                            to={{
                              pathname: `/route/${parent.id}`,
                              search: `?p=${point.id}`,
                            }}
                          >
                            <span className="underline text-primary-500">
                              {parent.name}
                            </span>
                          </Link>
                        ))}
                      </Concatenator>
                      .
                    </span>
                  </>
                )}
          </div>
        </div>

        <div className="flex gap-2">
          <Restricted>
            <ImageUploadButton pointId={point.id} />
            <ConfirmedDeleteButton
              mutation={deletePoint}
              target={`${label.name} #${label.no}`}
            />
          </Restricted>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 py-4">
        {bolts.data
          ?.slice()
          ?.sort((b1: Bolt) => (b1.position === "left" ? -1 : 1))
          ?.map((bolt) => (
            <BoltDetails
              key={bolt.id}
              bolt={bolt}
              totalNumberOfBolts={bolts.data.length}
            />
          ))}
      </div>

      {!images ? (
        <Loader />
      ) : (
        <>
          <Feed
            items={images
              .slice()
              .sort((i1, i2) =>
                compareDesc(new Date(i1.timestamp), new Date(i2.timestamp))
              )
              .map((image, index) => ({
                key: index,
                header: (
                  <p className="text-xs">
                    <span className="text-primary-500">{image.userId}</span>
                    <br />
                    <span>
                      Laddade upp foto{" "}
                      <span className="font-bold">
                        {new Date(image.timestamp).getFullYear()}
                      </span>
                    </span>
                  </p>
                ),
                value: (
                  <ImageThumbnail
                    image={image}
                    key={image.id}
                    onClick={() => setCurrImg(image.id)}
                  />
                ),
              }))}
          />
          {currImg !== undefined && (
            <ImageCarousel
              selectedImageId={currImg}
              images={images ?? []}
              onClose={() => setCurrImg(undefined)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default PointDetails;
