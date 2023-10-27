import { ActionIcon } from "@mantine/core";
import { IconArrowsVertical } from "@tabler/icons-react";
import classes from "./PointInserter.module.css";

export const PointInserter = () => {
  return (
    <div className={classes.container}>
      <div className={classes.inner}>
        <ActionIcon variant="subtle">
          <IconArrowsVertical size={14} />
        </ActionIcon>
      </div>
    </div>
  );
};
