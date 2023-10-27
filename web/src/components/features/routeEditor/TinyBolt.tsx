import { Card } from "@mantine/core";
import { IconSettings2 } from "@tabler/icons-react";
import classes from "./TinyBolt.module.css";

export const TinyBolt = () => {
  return (
    <div className={classes.card}>
      <IconSettings2 size={14} />
    </div>
  );
};
