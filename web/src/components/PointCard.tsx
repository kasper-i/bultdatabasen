import configData from "config.json";
import { Point } from "models/point";
import { useCreateBolt } from "queries/boltQueries";
import { useImages } from "queries/imageQueries";
import { useRole } from "queries/roleQueries";
import React, { ReactElement, useMemo, useState } from "react";
import ImgsViewer from "react-images-viewer";
import { useHistory } from "react-router";
import { Button, Icon, List, Loader } from "semantic-ui-react";
import Restricted from "./Restricted";
import ImageDropzone from "./ImageDropzone";
import clsx from "clsx";

interface Props {
  point: Point;
  number: number;
  routeId: string;
}

function PointCard({ point, number, routeId }: Props): ReactElement {
  const history = useHistory();
  const createBolt = useCreateBolt(routeId);
  const images = useImages(point.id);

  const [currImg, setCurrImg] = useState<number>();

  const sharedParents = useMemo(
    () => point.parents.filter((parent) => parent.id !== routeId),
    [point.parents, routeId]
  );

  const translateBoltType = (boltType: "expansion" | "glue") => {
    switch (boltType) {
      case "expansion":
        return "Borrbult";
      case "glue":
        return "Limbult";
    }
  };

  return (
    <div className="flex flex-col items-start p-4">
      <div className="flex justify-between w-full items-start">
        <div>
          <span className="text-4xl font-bold">#{number}</span>

          {sharedParents.length > 0 && (
            <div className="flex space-x-1">
              <span className="whitespace-nowrap">Delad med</span>
              <div className="flex space-x-1">
                {sharedParents.map((parent) => (
                  <span
                    className="underline cursor-pointer"
                    onClick={() =>
                      history.push(`/route/${parent.id}?point=${point.id}`)
                    }
                  >
                    {parent.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="pt-2">{`${point.bolts.length} bultar`}</p>
      <ul className="list-disc list-inside py-2.5">
        {point.bolts.map((bolt) => (
          <li key={bolt.id}>{translateBoltType(bolt.type)}</li>
        ))}
      </ul>
      <Restricted>
        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-shrink-0"
            compact
            primary
            size="small"
            onClick={() =>
              createBolt.mutate({
                pointId: point.id,
                bolt: { type: "expansion" },
              })
            }
          >
            <Icon name="add" />
            Expanderbult
          </Button>
          <Button
            className="flex-shrink-0"
            compact
            primary
            size="small"
            onClick={() =>
              createBolt.mutate({ pointId: point.id, bolt: { type: "glue" } })
            }
          >
            <Icon name="add" />
            Limbult
          </Button>
        </div>
      </Restricted>

      <h5 className="font-bold text-2xl mt-5 py-2.5">Bilder</h5>
      <div className="flex flex-wrap pb-4 gap-5">
        {images.isLoading ? (
          <Loader />
        ) : (
          <>
            {images.data?.map((image, index) => (
              <div
                key={image.id}
                style={
                  image.width < image.height
                    ? { width: 120, height: 160 }
                    : { width: 160, height: 120 }
                }
                className="cursor-pointer"
              >
                <img
                  className={clsx(
                    image.width < image.height ? "max-h-full" : "max-w-full",
                    "rounded"
                  )}
                  onClick={() => setCurrImg(index)}
                  src={`${configData.API_URL}/images/${image.id}/thumb`}
                  alt=""
                />
              </div>
            ))}
            <ImgsViewer
              imgs={images.data?.map((image) => ({
                src: `${configData.API_URL}/images/${image.id}`,
                thumbnail: `${configData.API_URL}/images/${image.id}/thumb`,
              }))}
              isOpen={currImg !== undefined}
              currImg={currImg}
              onClose={() => setCurrImg(undefined)}
              onClickPrev={() =>
                setCurrImg((index) => (index != null ? index - 1 : undefined))
              }
              onClickNext={() =>
                setCurrImg((index) => (index != null ? index + 1 : undefined))
              }
              onClickThumbnail={(index: number) => setCurrImg(index)}
              showThumbnails
            />
          </>
        )}
        <Restricted>
          <ImageDropzone key={point.id} pointId={point.id} />
        </Restricted>
      </div>
    </div>
  );
}

export default PointCard;
