import { InsertPosition } from "@/Api";
import { usePermissions } from "@/hooks/authHooks";
import { Point } from "@/models/point";
import { useAttachPoint } from "@/queries/pointQueries";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { IconChevronRight, IconPlus } from "@tabler/icons-react";
import { FC, ReactElement, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CreateFirstPointWizard } from "./CreateFirstPointWizard";
import { usePointLabeler } from "./hooks";
import PointDetails from "./PointDetails";
import classes from "./PointEditor.module.css";
import PointWizard from "./PointWizard";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [insertPosition, setInsertPosition] = useState<InsertPosition>();
  const createPoint = useAttachPoint(routeId);

  const editable = usePermissions(routeId)?.some(
    (permission) => permission === "write"
  );

  const selectedPointId = searchParams.get("p");

  useEffect(() => {
    const { data, isSuccess } = createPoint;

    if (isSuccess) {
      setInsertPosition(undefined);
      changePoint(data.id);
    }
  }, [createPoint.isSuccess]);

  useEffect(() => {
    if (
      selectedPointId &&
      !points.some((point) => point.id === selectedPointId)
    ) {
      deselectPoint();
    }
  }, [points]);

  const pointLabeler = usePointLabeler(points);

  const changePoint = (pointId: string) => {
    setInsertPosition(undefined);

    if (pointId === selectedPointId) {
      deselectPoint();
    } else {
      setSearchParams({ p: pointId });
    }
  };

  const deselectPoint = () => {
    setSearchParams({});
  };

  if (points.length === 0) {
    return (
      <CreateFirstPointWizard
        points={points}
        routeId={routeId}
        routeParentId={routeParentId}
        createPoint={createPoint}
        insertPosition={insertPosition}
      />
    );
  }

  const selectedPoint = points.find((point) => point.id === selectedPointId);
  const navigable = insertPosition === undefined;

  const AddPointButton: FC<{ insertPosition: InsertPosition }> = ({
    insertPosition,
  }) => {
    return (
      <Button
        onClick={() => {
          deselectPoint();
          setInsertPosition(insertPosition);
        }}
        size="xs"
        leftSection={<IconPlus size={14} />}
        variant="light"
      >
        Ny punkt
      </Button>
    );
  };

  return (
    <Stack gap="sm" align="end">
      {points
        .slice()
        .reverse()
        .flatMap((point, index) => {
          const selected = point.id === selectedPointId;
          const showWizard = insertPosition?.pointId === point.id;

          const { name, no } = pointLabeler(point.id);

          const cards = [];

          if (editable && index === 0) {
            cards.push(
              <AddPointButton
                key={`add-after-${point.id}`}
                insertPosition={{ pointId: point.id, order: "after" }}
              />
            );
          }

          cards.push(
            <Card key={point.id} withBorder className={classes.point}>
              {selected && selectedPoint !== undefined ? (
                <Suspense fallback={<Loader type="bars" />}>
                  <PointDetails
                    point={selectedPoint}
                    label={pointLabeler(selectedPoint.id)}
                    routeId={routeId}
                    onClose={deselectPoint}
                  />
                </Suspense>
              ) : (
                <Group
                  justify="start"
                  gap="xs"
                  onClick={navigable ? () => changePoint(point.id) : undefined}
                >
                  <ActionIcon variant="subtle">
                    <IconChevronRight size={14} />
                  </ActionIcon>
                  <Text fw={500} size="md">
                    {name} {no}
                  </Text>
                </Group>
              )}
            </Card>
          );

          if (editable) {
            cards.push(
              <AddPointButton
                key={`add-before-${point.id}`}
                insertPosition={{ pointId: point.id, order: "before" }}
              />
            );
          }

          if (showWizard) {
            cards.splice(
              insertPosition.order === "after" ? 0 : cards.length - 1,
              1,
              <div key="new">
                <Card>
                  <PointWizard
                    mutation={createPoint}
                    position={insertPosition}
                    onCancel={() => setInsertPosition(undefined)}
                    routeId={routeId}
                    routeParentId={routeParentId}
                    illegalPoints={points.map((point) => point.id)}
                  />
                </Card>
              </div>
            );
          }

          return cards;
        })}
    </Stack>
  );
};

export default PointEditor;
