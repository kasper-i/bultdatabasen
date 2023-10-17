import Restricted from "@/components/Restricted";
import { Time } from "@/components/atoms/Time";
import { Bolt } from "@/models/bolt";
import { useUpdateBolt } from "@/queries/boltQueries";
import {
  diameterToFraction,
  positionToLabel,
  translateBoltType,
} from "@/utils/boltUtils";
import {
  ActionIcon,
  Button,
  Card,
  Grid,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { IconArchive, IconEdit, IconMenu2 } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useEffect, useState } from "react";
import AdvancedBoltEditor from "./AdvancedBoltEditor";

const LabelAndValue: FC<{
  label: string;
  value?: ReactNode;
  className?: string;
}> = ({ label, value, className }) => {
  if (value === undefined) {
    return <Fragment />;
  }

  return (
    <Text size="sm" className={className}>
      <Text fw={600}>{label}</Text>
      <Text>{value}</Text>
    </Text>
  );
};

interface Props {
  bolt: Bolt;
  totalNumberOfBolts: number;
}

const BoltDetails = ({ bolt, totalNumberOfBolts }: Props) => {
  const [action, setAction] = useState<"edit">();
  const [editedBolt, setEditedBolt] = useState(bolt);

  const updateBolt = useUpdateBolt(bolt.id);

  useEffect(() => {
    setEditedBolt(bolt);
  }, [bolt]);

  useEffect(() => {
    if (updateBolt.isSuccess) {
      setAction(undefined);
    }
  }, [updateBolt.isSuccess]);

  useEffect(() => {
    action === "edit" && setEditedBolt(bolt);
  }, [action]);

  const textStyle = bolt.dismantled ? "line-through opacity-50" : undefined;

  return (
    <Card bg="brand.4" c="white">
      <Group justify="space-between">
        <Text fw={500}>
          <span>
            {positionToLabel(
              totalNumberOfBolts === 1 ? undefined : bolt.position
            )}
          </span>
        </Text>

        <Restricted>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="outline" color="white">
                <IconMenu2 size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => setAction("edit")}
              >
                Redigera
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconArchive size={14} />}
                onClick={() =>
                  updateBolt.mutate({
                    ...bolt,
                    dismantled: new Date(),
                  })
                }
              >
                Demontera
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Restricted>
      </Group>

      {action === "edit" ? (
        <Stack gap="sm">
          <AdvancedBoltEditor bolt={editedBolt} onChange={setEditedBolt} />
          <Group justify="end">
            <Button onClick={() => setAction(undefined)} variant="subtle">
              Avbryt
            </Button>

            <Button
              loading={updateBolt.isLoading}
              onClick={() => updateBolt.mutate(editedBolt)}
            >
              Spara
            </Button>
          </Group>
        </Stack>
      ) : (
        <Grid>
          <Grid.Col>
            <LabelAndValue
              label="Tillverkare"
              value={bolt.manufacturer}
              className={textStyle}
            />
          </Grid.Col>

          <Grid.Col>
            <LabelAndValue
              label="Modell"
              value={bolt.model}
              className={textStyle}
            />
          </Grid.Col>

          <Grid.Col>
            <LabelAndValue
              label="Typ"
              value={translateBoltType(bolt.type)}
              className={textStyle}
            />
          </Grid.Col>

          <Grid.Col>
            <LabelAndValue
              label="Material"
              value={bolt.material}
              className={textStyle}
            />
          </Grid.Col>

          <Grid.Col>
            <LabelAndValue
              label="Diameter"
              value={
                bolt.diameter
                  ? `${diameterToFraction(bolt.diameter)}${
                      bolt.diameterUnit === "inch" ? '"' : "mm"
                    }`
                  : undefined
              }
              className={textStyle}
            />
          </Grid.Col>

          <Grid.Col>
            <LabelAndValue
              label="Installerad"
              value={
                bolt.installed ? (
                  <Time time={bolt.installed} datetimeFormat="yyyy" />
                ) : undefined
              }
              className={textStyle}
            />
          </Grid.Col>

          <Grid.Col span={2}>
            <LabelAndValue
              label="Demonterad"
              value={
                bolt.dismantled ? <Time time={bolt.dismantled} /> : undefined
              }
            />
          </Grid.Col>
        </Grid>
      )}
    </Card>
  );
};

export default BoltDetails;
