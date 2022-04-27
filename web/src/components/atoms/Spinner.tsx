import React, { FC } from "react";
import { Spinner as ReactActivitySpinner } from "react-activity";
import "react-activity/dist/Spinner.css";

const Spinner: FC<{ active?: boolean; className?: string }> = ({
  active,
  className,
}) => {
  if (active === true) {
    return <ReactActivitySpinner className={className} />;
  } else {
    return <></>;
  }
};

export default Spinner;
