import { Time } from "@/components/atoms/Time";
import { Concatenator } from "@/components/Concatenator";
import { ImageCarousel } from "@/components/ImageCarousel";
import ImageThumbnail from "@/components/ImageThumbnail";
import ImageUploadButton from "@/components/ImageUploadButton";
import DeleteDialog from "@/components/molecules/DeleteDialog";
import Restricted from "@/components/Restricted";
import UserName from "@/components/UserName";
import { Bolt } from "@/models/bolt";
import { Point } from "@/models/point";
import { Author } from "@/models/user";
import { useBolts, useCreateBolt } from "@/queries/boltQueries";
import { useComments } from "@/queries/commentQueries";
import { useImages } from "@/queries/imageQueries";
import { useDetachPoint } from "@/queries/pointQueries";
import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  Group,
  Menu,
  Space,
  Stack,
  Text,
  Timeline,
} from "@mantine/core";
import {
  IconChevronUp,
  IconMenu2,
  IconMessage,
  IconPhoto,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { compareDesc } from "date-fns";
import {
  Key,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import AdvancedBoltEditor from "./AdvancedBoltEditor";
import BoltDetails from "./BoltDetails";
import { CommentView } from "./CommentView";
import { PointLabel } from "./hooks";
import { PostComment } from "./PostComment";
import classes from "./PointDetails.module.css";

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

  interface FeedItem {
    key: Key;
    timestamp: Date;
    icon: ReactNode;
    title: string;
    action: string;
    author: Author;
    value: ReactNode;
  }

  const feedItems = useMemo(() => {
    const feedItems: FeedItem[] = [];

    images?.forEach((image) => {
      feedItems.push({
        key: image.id,
        icon: <IconPhoto size={14} />,
        timestamp: image.timestamp,
        title: "Nytt foto",
        action: "laddade upp foto",
        author: image.author,
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
        icon: <IconMessage size={14} />,
        timestamp: comment.createdAt,
        title: "Ny kommentar",
        action: "lämnade kommentar",
        author: comment.author,
        value: <CommentView comment={comment} />,
      });
    });

    feedItems.sort((i1, i2) => compareDesc(i1.timestamp, i2.timestamp));

    return feedItems;
  }, [comments, images]);

  return (
    <Stack gap="sm" align="stretch">
      <Group justify="space-between" align="start" gap="xs">
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconChevronUp size={14} />
        </ActionIcon>
        <div className={classes.title}>
          <Text fw={500} size="md">
            {label.name} {label.no}
          </Text>

          <Text c="dimmed" size="sm">
            {sharedParents.length === 0
              ? "Delas ej med annan led."
              : sharedParents.length > 0 && (
                  <>
                    <span>Delas med</span>
                    <span>
                      <Concatenator>
                        {sharedParents.map((parent) => (
                          <Anchor
                            key={point.id}
                            component={Link}
                            to={{
                              pathname: `/route/${parent.id}`,
                              search: `?p=${point.id}`,
                            }}
                          >
                            {parent.name}
                          </Anchor>
                        ))}
                      </Concatenator>
                      .
                    </span>
                  </>
                )}
          </Text>
        </div>

        <Stack gap="sm">
          <Restricted>
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <ActionIcon variant="light">
                  <IconMenu2 size={14} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconPlus size={14} />}
                  onClick={() => setAction("add_bolt")}
                >
                  Ny bult
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => setAction("delete")}
                >
                  Radera
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            {action === "delete" && (
              <DeleteDialog
                mutation={deletePoint}
                target={`${label.name} ${label.no}`}
                onClose={() => setAction(undefined)}
              />
            )}
          </Restricted>
        </Stack>
      </Group>

      <Stack gap="sm" align="stretch">
        {action === "add_bolt" && (
          <Card withBorder>
            <Stack gap="sm">
              <AdvancedBoltEditor
                bolt={newBolt}
                onChange={setNewBolt}
                hideDismantled
              />
              <Group gap="sm" justify="end">
                <Button onClick={() => setAction(undefined)} variant="subtle">
                  Avbryt
                </Button>
                <Button
                  loading={createBolt.isLoading}
                  onClick={() => createBolt.mutate(newBolt)}
                >
                  Skapa
                </Button>
              </Group>
            </Stack>
          </Card>
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
          <Group justify="space-between">
            <PostComment parentResourceId={point.id} />
            <ImageUploadButton pointId={point.id} />
          </Group>
        </Restricted>
      </Stack>

      <Timeline bulletSize={24}>
        {feedItems.map(
          ({ key, title, action, author, timestamp, value, icon }) => (
            <Timeline.Item key={key} title={title} bullet={icon}>
              <Text c="dimmed" size="sm">
                <UserName user={author} /> {action} <Time time={timestamp} />
              </Text>
              <Space h="xs" />
              {value}
            </Timeline.Item>
          )
        )}
      </Timeline>

      {currImg !== undefined && (
        <ImageCarousel
          pointId={point.id}
          selectedImageId={currImg}
          images={images ?? []}
          onClose={() => setCurrImg(undefined)}
        />
      )}
    </Stack>
  );
}

export default PointDetails;
