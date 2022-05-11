import React, { FC } from "react";

const Progress: FC<{ percent: number }> = ({ percent }) => {
  return (
    <div className="relative h-5 w-full bg-neutral-50 rounded-3xl shadow-sm">
      <div
        className="absolute inset-0 bg-primary-500 rounded-3xl"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default Progress;
