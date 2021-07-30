import configData from "config.json";
import { BoltType } from "models/bolt";
import { Point } from "models/point";
import { useCreateBolt } from "queries/boltQueries";
import { useImages } from "queries/imageQueries";
import React, { ReactElement, useMemo, useState } from "react";
import ImgsViewer from "react-images-viewer";
import { useHistory } from "react-router";
import { Button, Dropdown, Icon, Loader } from "semantic-ui-react";
import { translateBoltType } from "utils/boltUtils";
import BoltDetails from "./BoltDetails";
import ImageDropzone from "./ImageDropzone";
import ImagePreview from "./ImagePreview";
import Restricted from "./Restricted";

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
  const [imagesLocked, setImagesLocked] = useState(false);
  const [selectedBoltType, setSelectedBoltType] =
    useState<BoltType>("expansion");

  const sharedParents = useMemo(
    () => point.parents.filter((parent) => parent.id !== routeId),
    [point.parents, routeId]
  );

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
      <div className="flex flex-wrap gap-5 py-5">
        {point.bolts.map((bolt) => (
          <BoltDetails
            routeId={routeId}
            pointId={point.id}
            key={bolt.id}
            bolt={bolt}
          />
        ))}
        <Restricted>
          <div key="new" className="">
            <Button.Group color="blue">
              <Button
                className="flex-shrink-0"
                compact
                primary
                size="small"
                loading={createBolt.isLoading}
                onClick={() =>
                  createBolt.mutate({
                    pointId: point.id,
                    bolt: { type: selectedBoltType },
                  })
                }
              >
                <Icon name="add" />
                {translateBoltType(selectedBoltType)}
              </Button>
              <Dropdown
                className="button icon"
                value={selectedBoltType}
                onChange={(_e, result) =>
                  result?.value !== undefined &&
                  setSelectedBoltType(result.value as BoltType)
                }
                options={[
                  { key: "expansion", text: "Borrbult", value: "expansion" },
                  { key: "glue", text: "Limbult", value: "glue" },
                ]}
                trigger={<></>}
              />
            </Button.Group>
          </div>
        </Restricted>
      </div>

      <div className="flex items-center w-full mt-5 py-2.5">
        <h5 className="font-bold text-2xl pr-2">Bilder</h5>
        <Restricted>
          <Button
            onClick={(e) => setImagesLocked((checked) => !checked)}
            icon={imagesLocked ? "unlock" : "lock"}
            size="small"
          />
        </Restricted>
      </div>
      <div className="flex flex-wrap pb-4 gap-5 pt-2.5">
        {images.isLoading ? (
          <Loader />
        ) : (
          <>
            {images.data?.map((image, index) => (
              <ImagePreview
                pointId={point.id}
                image={image}
                onClick={() => setCurrImg(index)}
                locked={!imagesLocked}
              />
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
