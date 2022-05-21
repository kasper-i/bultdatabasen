import React, { FC } from "react";

const Progress: FC<{ percent: number }> = ({ percent }) => {
  return (
    <div className="h-full w-full bg-neutral-50 rounded-md shadow-sm overflow-hidden">
      <div
        className="h-full w-0 bg-primary-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default Progress;
