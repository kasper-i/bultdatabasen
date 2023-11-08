import { FC, ReactNode } from "react";
import classes from "./Spanner.module.css";

export const Spanner: FC<{ cols: number; children: ReactNode }> = ({
  cols,
  children,
}) => {
  return (
    <div
      style={{
        gridColumnEnd: `span ${cols}`,
      }}
      className={classes.span}
    >
      {children}
    </div>
  );
};
