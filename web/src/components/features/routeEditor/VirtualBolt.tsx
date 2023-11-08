import { ActionIcon, Button, Card, Group, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import AdvancedBoltEditor from "./AdvancedBoltEditor";
import classes from "./VirtualBolt.module.css";

export const VirtualBolt: FC<{ insertPosition?: InsertPosition }> = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Ny bult" centered>
        <Stack gap="sm">
          <AdvancedBoltEditor bolt={{ type: "expansion" }} hideDismantled />
          <Group gap="sm" justify="end">
            <Button onClick={close} variant="subtle">
              Avbryt
            </Button>
            <Button>Skapa</Button>
          </Group>
        </Stack>
      </Modal>

      <Card className={classes.card} withBorder>
        <ActionIcon variant="subtle" onClick={open}>
          <IconPlus size={14} />
        </ActionIcon>
      </Card>
    </>
  );
};
