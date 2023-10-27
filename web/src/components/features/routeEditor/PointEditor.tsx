import { Point } from "@/models/point";
import { useAttachPoint } from "@/queries/pointQueries";
import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { IconArrowMerge } from "@tabler/icons-react";
import { ReactElement } from "react";
import { usePointLabeler } from "./hooks";
import classes from "./PointEditor.module.css";
import { TinyBolt } from "./TinyBolt";
import { VirtualBolt } from "./VirtualBolt";
import { VirtualPoint } from "./VirtualPoint";

interface Props {
  routeId: string;
  routeParentId: string;
  points: Point[];
}

const PointEditor = ({
  points,
  routeId,
  routeParentId,
}: Props): ReactElement => {
  const createPoint = useAttachPoint(routeId);

  const pointLabeler = usePointLabeler(points);

  return (
    <div className={classes.grid}>
      <VirtualPoint>
        <VirtualBolt />
        <Text size="sm" c="dimmed">
          /
        </Text>
        <ActionIcon variant="light">
          <IconArrowMerge size={14} />
        </ActionIcon>
      </VirtualPoint>

      {points
        .slice()
        .reverse()
        .flatMap((point, index) => {
          const { name, no } = pointLabeler(point.id);

          const cards = [];

          if (index === 0) {
            cards.push();
          }

          cards.push(
            <>
              <Card key={point.id} withBorder className={classes.point}>
                <Stack gap="xs">
                  <Text size="xs" c="dimmed">
                    {name} {no}
                  </Text>
                  <Group gap="sm">
                    {index === 0 && <TinyBolt />}
                    <TinyBolt />
                    <VirtualBolt />
                  </Group>
                </Stack>
              </Card>
              <Group>
                <VirtualPoint>
                  <VirtualBolt />
                  <Text size="sm" c="dimmed">
                    /
                  </Text>
                  <ActionIcon variant="light">
                    <IconArrowMerge size={14} />
                  </ActionIcon>
                </VirtualPoint>
              </Group>
            </>
          );

          return cards;
        })}
    </div>
  );
};

export default PointEditor;
