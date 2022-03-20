import React, { FC } from "react";
import { Spinner } from "react-activity";
import "react-activity/dist/Spinner.css";

const Loader: FC<{ active?: boolean }> = ({ active }) => {
  if (active === true) {
    return <Spinner />;
  } else {
    return <></>;
  }
};

export default Loader;
