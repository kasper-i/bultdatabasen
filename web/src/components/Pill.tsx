import { ReactNode } from "react";
import classes from "./Pill.module.css";
import clsx from "clsx";

interface Props {
  children: ReactNode;
  className?: string;
}

const Pill = ({ children, className }: Props) => {
  return <div className={clsx(className, classes.pill)}>{children}</div>;
};

export default Pill;
