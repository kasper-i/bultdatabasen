import Button from "@/components/atoms/Button";
import { Concatenator } from "@/components/Concatenator";
import Feed, { FeedItem } from "@/components/Feed";
import { ImageCarousel } from "@/components/ImageCarousel";
import ImageThumbnail from "@/components/ImageThumbnail";
import ImageUploadButton from "@/components/ImageUploadButton";
import DeleteDialog from "@/components/molecules/DeleteDialog";
import { Menu } from "@/components/molecules/Menu";
import Restricted from "@/components/Restricted";
import { Bolt } from "@/models/bolt";
import { Point } from "@/models/point";
import { useBolts, useCreateBolt } from "@/queries/boltQueries";
import { useComments } from "@/queries/commentQueries";
import { useImages } from "@/queries/imageQueries";
import { useDetachPoint } from "@/queries/pointQueries";
import { compareDesc } from "date-fns";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdvancedBoltEditor from "./AdvancedBoltEditor";
import BoltDetails from "./BoltDetails";
import { CommentView } from "./CommentView";
import { PointLabel } from "./hooks";
import { PostComment } from "./PostComment";

interface Props {
  point: Point;
  routeId: string;
  label: PointLabel;
  onClose: () => void;
}

function PointDetails({ point, routeId, label, onClose }: Props): ReactElement {
  const deletePoint = useDetachPoint(routeId, point.id);
  const { data: images } = useImages(point.id);
  const { data: comments } = useComments(point.id);
  const bolts = useBolts(point.id);
  const [currImg, setCurrImg] = useState<string>();
  const [action, setAction] = useState<"delete" | "add_bolt">();
  const [newBolt, setNewBolt] = useState<Omit<Bolt, "id" | "parentId">>({
    type: "expansion",
    installed: new Date(),
  });
  const createBolt = useCreateBolt(point.id);

  const numInstalledBolts =
    bolts.data?.filter((bolt) => !bolt.dismantled)?.length ?? 0;

  const sharedParents = point.parents.filter((parent) => parent.id !== routeId);

  useEffect(() => {
    createBolt.isSuccess && setAction(undefined);
  }, [createBolt.isSuccess]);

  const feedItems = useMemo(() => {
    const feedItems: FeedItem[] = [];

    images?.forEach((image) => {
      feedItems.push({
        key: image.id,
        icon: "image",
        timestamp: image.timestamp,
        description: "Laddade upp foto",
        user: { id: image.userId },
        value: (
          <ImageThumbnail
            image={image}
            key={image.id}
            onClick={() => setCurrImg(image.id)}
          />
        ),
      });
    });

    comments?.forEach((comment) => {
      feedItems.push({
        key: comment.id,
        icon: "comment",
        timestamp: comment.createdAt,
        description: "Lämnade kommentar",
        user: comment.user,
        value: <CommentView comment={comment} />,
      });
    });

    feedItems.sort((i1, i2) => compareDesc(i1.timestamp, i2.timestamp));

    return feedItems;
  }, [comments, images]);

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div className="h-6 cursor-pointer" onClick={onClose}>
            {label.name}
            <span className="font-medium text-primary-500 ml-1">
              {label.no}
            </span>
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
            <Menu
              items={[
                {
                  label: "Radera",
                  icon: "trash",
                  className: "text-red-500",
                  onClick: () => setAction("delete"),
                },
                {
                  label: "Ny bult",
                  icon: "plus",
                  onClick: () => setAction("add_bolt"),
                },
              ]}
            />
            {action === "delete" && (
              <DeleteDialog
                mutation={deletePoint}
                target={`${label.name} ${label.no}`}
                onClose={() => setAction(undefined)}
              />
            )}
          </Restricted>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 py-4">
        {action === "add_bolt" && (
          <div className="w-full xs:w-64 flex flex-col justify-between border p-2 rounded-md">
            <AdvancedBoltEditor
              bolt={newBolt}
              onChange={setNewBolt}
              hideDismantled
            />
            <div className="flex gap-x-2.5 py-2 mt-2">
              <Button onClick={() => setAction(undefined)} outlined>
                Avbryt
              </Button>
              <Button
                loading={createBolt.isLoading}
                onClick={() => createBolt.mutate(newBolt)}
              >
                Skapa
              </Button>
            </div>
          </div>
        )}
        {bolts.data
          ?.slice()
          ?.sort((b1: Bolt) => (b1.position === "left" ? -1 : 1))
          ?.map((bolt) => (
            <BoltDetails
              key={bolt.id}
              bolt={bolt}
              totalNumberOfBolts={numInstalledBolts}
            />
          ))}

        <Restricted>
          <div className="flex flex-row gap-2 w-full mt-1">
            <PostComment parentResourceId={point.id} />
            <ImageUploadButton pointId={point.id} />
          </div>
        </Restricted>
      </div>

      <Feed items={feedItems} />
      {currImg !== undefined && (
        <ImageCarousel
          pointId={point.id}
          selectedImageId={currImg}
          images={images ?? []}
          onClose={() => setCurrImg(undefined)}
        />
      )}
    </div>
  );
}

export default PointDetails;
