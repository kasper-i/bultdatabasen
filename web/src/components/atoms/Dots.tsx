import React, { FC } from "react";
import { Dots as ReactActivityDots } from "react-activity";
import "react-activity/dist/Dots.css";

const Dots: FC<{ className?: string }> = ({ className }) => {
  return <ReactActivityDots className={className} />;
};

export default Dots;
