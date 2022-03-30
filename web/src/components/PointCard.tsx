import { Point } from "@/models/point";
import { useBolts } from "@/queries/boltQueries";
import { useImages } from "@/queries/imageQueries";
import { useDetachPoint } from "@/queries/pointQueries";
import React, { ReactElement, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "./atoms/IconButton";
import Loader from "./atoms/Loader";
import BoltDetails from "./BoltDetails";
import { Concatenator } from "./Concatenator";
import ImageDropzone from "./ImageDropzone";
import ImageGallery from "./ImageGallery";
import ConfirmedDeleteButton from "./molecules/ConfirmedDeleteButton";
import Restricted from "./Restricted";

interface Props {
  point: Point;
  routeId: string;
}

function PointCard({ point, routeId }: Props): ReactElement {
  const deletePoint = useDetachPoint(routeId, point.id);
  const images = useImages(point.id);
  const bolts = useBolts(point.id);

  const [imagesLocked, setImagesLocked] = useState(false);

  const sharedParents = point.parents.filter((parent) => parent.id !== routeId);

  return (
    <div className="bg-white shadow-sm border border-gray-300 border-t-4 border-t-primary-500 flex flex-col items-start p-4">
      <div className="flex justify-between w-full items-start">
        <div>
          <span className="text-4xl font-bold">#{point.number}</span>

          {sharedParents.length > 0 && (
            <div className="fle flex-wrap space-x-1">
              <span className="whitespace-nowrap">Delad med</span>
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
            </div>
          )}
        </div>
        <Restricted>
          <ConfirmedDeleteButton mutation={deletePoint} target="punkten" />
        </Restricted>
      </div>

      <div className="flex flex-wrap gap-5 py-5">
        {bolts.data?.map((bolt) => (
          <BoltDetails key={bolt.id} bolt={bolt} />
        ))}
      </div>

      <div className="flex items-center w-full py-2.5 gap-2">
        <h5 className="font-bold text-2xl">Bilder</h5>
        <Restricted>
          <IconButton
            onClick={() => setImagesLocked((checked) => !checked)}
            icon={imagesLocked ? "unlock" : "lock"}
          />
        </Restricted>
      </div>
      {images.data === undefined ? (
        <Loader />
      ) : (
        <div className="w-full">
          <ImageGallery
            className="mb-4"
            images={images.data}
            locked={imagesLocked}
            pointId={point.id}
          />
        </div>
      )}
      <ImageDropzone key="new" pointId={point.id} />
    </div>
  );
}

export default PointCard;
