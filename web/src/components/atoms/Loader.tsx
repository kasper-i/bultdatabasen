import React, { FC } from "react";
import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

const Loader: FC<{ active?: boolean; className?: string }> = ({
  active,
  className,
}) => {
  if (active === true) {
    return <Dots className={className} />;
  } else {
    return <></>;
  }
};

export default Loader;
