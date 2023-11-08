import { Card } from "@mantine/core";
import { FC, ReactNode } from "react";
import classes from "./VirtualPoint.module.css";

export const VirtualPoint: FC<{ children?: ReactNode }> = ({ children }) => {
  return <div className={classes.card}>{children}</div>;
};
