import IconButton from "@/components/atoms/IconButton";
import Loader from "@/components/atoms/Loader";
import { Concatenator } from "@/components/Concatenator";
import BoltDetails from "@/components/features/routeEditor/BoltDetails";
import ImageDropzone from "@/components/ImageDropzone";
import ImageGallery from "@/components/ImageGallery";
import ConfirmedDeleteButton from "@/components/molecules/ConfirmedDeleteButton";
import Restricted from "@/components/Restricted";
import { Point } from "@/models/point";
import { useBolts } from "@/queries/boltQueries";
import { useImages } from "@/queries/imageQueries";
import { useDetachPoint } from "@/queries/pointQueries";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  point: Point;
  routeId: string;
}

function PointCard({ point, routeId }: Props): ReactElement {
  const deletePoint = useDetachPoint(routeId, point.id);
  const images = useImages(point.id);
  const bolts = useBolts(point.id);
  const ref = useRef<HTMLDivElement>(null);

  const [imagesLocked, setImagesLocked] = useState(false);

  useEffect(() => {
    ref.current?.scrollIntoView(false);
  }, []);

  const sharedParents = point.parents.filter((parent) => parent.id !== routeId);

  return (
    <div>
      <div className="flex justify-between">
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
          <BoltDetails
            key={bolt.id}
            bolt={bolt}
            totalNumberOfBolts={bolts.data.length}
          />
        ))}
      </div>

      <div className="flex items-center w-full py-2.5 gap-2">
        <h5 className="font-bold text-2xl">Bilder</h5>
        <Restricted>
          <IconButton
            tiny
            onClick={() => setImagesLocked((checked) => !checked)}
            icon={imagesLocked ? "unlock" : "lock"}
          />
        </Restricted>
      </div>
      {images.isLoading ? (
        <Loader />
      ) : (
        images.data && (
          <div className="w-full">
            <ImageGallery
              className="mb-4"
              images={images.data}
              locked={imagesLocked}
              pointId={point.id}
            />
          </div>
        )
      )}
      <ImageDropzone key="new" pointId={point.id} />
    </div>
  );
}

export default PointCard;
