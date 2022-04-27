import React from "react";
import { Digital } from "react-activity";
import "react-activity/dist/Digital.css";

const Loader = () => {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <Digital size={32} />
    </div>
  );
};

export default Loader;
