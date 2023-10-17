import { CreatePointRequest, InsertPosition } from "@/Api";
import Restricted from "@/components/Restricted";
import { Point } from "@/models/point";
import { ActionIcon, Anchor, Card, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { UseMutationResult } from "@tanstack/react-query";
import { FC, useState } from "react";
import classes from "./CreateFirstPointWizard.module.css";
import PointWizard from "./PointWizard";

export const CreateFirstPointWizard: FC<{
  routeId: string;
  routeParentId: string;
  points: Point[];
  createPoint: UseMutationResult<Point, unknown, CreatePointRequest, unknown>;
  insertPosition?: InsertPosition;
}> = ({ routeId, routeParentId, points, createPoint, insertPosition }) => {
  const [openInitialWizard, setOpenInitialWizard] = useState(false);

  const createFirst = () => {
    setOpenInitialWizard(true);
  };

  return (
    <Card withBorder className={classes.card}>
      {openInitialWizard ? (
        <PointWizard
          mutation={createPoint}
          hint="anchor"
          position={insertPosition}
          onCancel={() => setOpenInitialWizard(false)}
          routeId={routeId}
          routeParentId={routeParentId}
          illegalPoints={points.map((point) => point.id)}
        />
      ) : (
        <Stack align="center" gap="sm">
          <Restricted>
            <ActionIcon onClick={() => createFirst()} size="lg">
              <IconPlus size={20} />
            </ActionIcon>
          </Restricted>
          <Text ta="center" c="dimmed" size="sm">
            På den här leden finns ännu inga dokumenterade bultar.
            <br />
            <Restricted>
              <Text component="span">
                <Anchor
                  component="button"
                  variant="subtle"
                  onClick={() => createFirst()}
                >
                  Lägg till
                </Anchor>{" "}
                en första ledbult eller ankare.
              </Text>
            </Restricted>
          </Text>
        </Stack>
      )}
    </Card>
  );
};
