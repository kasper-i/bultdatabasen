import configData from "config.json";
import { BoltType } from "models/bolt";
import { Image } from "models/image";
import { Point } from "models/point";
import moment from "moment";
import { useBolts, useCreateBolt } from "queries/boltQueries";
import { useChildren } from "queries/commonQueries";
import { useImages } from "queries/imageQueries";
import { useDetachPoint } from "queries/pointQueries";
import React, { Fragment, ReactElement, useMemo, useState } from "react";
import ImgsViewer from "react-images-viewer";
import { useHistory } from "react-router";
import { Button, Dropdown, Icon, Loader } from "semantic-ui-react";
import { translateBoltType } from "utils/boltUtils";
import BoltDetails from "./BoltDetails";
import ImageDropzone from "./ImageDropzone";
import ImageThumbnail from "./ImageThumbnail";
import Restricted from "./Restricted";

interface Props {
  point: Point;
  number: number;
  routeId: string;
}

function PointCard({ point, number, routeId }: Props): ReactElement {
  const history = useHistory();
  const createBolt = useCreateBolt(routeId, point.id);
  const deletePoint = useDetachPoint(routeId, point.id);
  const images = useImages(point.id);
  const bolts = useBolts(point.id);
  const children = useChildren(point.id);

  const [currImg, setCurrImg] = useState<number>();
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
    (children.data !== undefined && children.data.length === 0);

  const renderImages = () => {
    const years = Array.from(imagesByYear.keys());

    years.sort().reverse();

    return (
      <div className="flex flex-wrap gap-3 pt-2.5">
        <>
          {years.map((year) => (
            <Fragment key={"year-" + year}>
              <div
                style={{ width: 40, height: 120 }}
                className="rounded border-gray-200 border-4 border-dotted flex justify-center items-center"
              >
                <h5 className="text-2xl transform -rotate-90">{year}</h5>
              </div>

              {imagesByYear.get(year)?.map((image, index) => (
                <ImageThumbnail
                  key={image.id}
                  pointId={point.id}
                  image={image}
                  onClick={() => setCurrImg(index)}
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
          <span className="text-4xl font-bold">#{number}</span>

          {sharedParents.length > 0 && (
            <div className="flex space-x-1">
              <span className="whitespace-nowrap">Delad med</span>
              <div className="flex space-x-1">
                {sharedParents.map((parent) => (
                  <span
                    key={point.id}
                    className="underline cursor-pointer"
                    onClick={() =>
                      history.push(`/route/${parent.id}/point/${point.id}`)
                    }
                  >
                    {parent.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => sessionStorage.setItem("copiedPoint", point.id)}
            icon="copy"
          />
          <Button
            loading={deletePoint.isLoading}
            onClick={() => deletePoint.mutate()}
            icon="trash"
            color="red"
            disabled={!allowDelete}
          />
        </div>
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
            <Button.Group color="blue">
              <Button
                className="flex-shrink-0"
                compact
                primary
                size="small"
                loading={createBolt.isLoading}
                onClick={() => createBolt.mutate({ type: selectedBoltType })}
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

      <div className="flex items-center w-full py-2.5">
        <h5 className="font-bold text-2xl pr-2">Bilder</h5>
        <Restricted>
          <Button
            onClick={(e) => setImagesLocked((checked) => !checked)}
            icon={imagesLocked ? "unlock" : "lock"}
            size="small"
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
          <ImgsViewer
            imgs={images.data?.map((image) => ({
              src: `${configData.API_URL}/images/${image.id}/lg`,
              thumbnail: `${configData.API_URL}/images/${image.id}/xs`,
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
    </div>
  );
}

export default PointCard;
