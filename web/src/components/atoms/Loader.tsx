import React, { FC } from "react";
import { Spinner } from "react-activity";
import "react-activity/dist/Spinner.css";

const Loader: FC<{ active?: boolean; className?: string }> = ({
  active,
  className,
}) => {
  if (active === true) {
    return <Spinner className={className} />;
  } else {
    return <></>;
  }
};

export default Loader;
