import { ActionIcon, Card } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import classes from "./VirtualBolt.module.css";

export const VirtualBolt: FC<{ insertPosition?: InsertPosition }> = () => {
  return (
    <Card className={classes.card} withBorder>
      <ActionIcon variant="subtle">
        <IconPlus size={14} />
      </ActionIcon>
    </Card>
  );
};
