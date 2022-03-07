import React, { ReactElement } from "react";

interface Props {
  label: string;
  count: number;
}

const ResourceCountRenderer = ({ label, count }: Props): ReactElement => {
  return (
    <div className="flex flex-col items-center bg-gray-200 drop-shadow shadow rounded p-1.5">
      <h1 className="text-2xl font-bold leading-none">{count}</h1>
      <p className="text-xs leading-relaxed">{label}</p>
    </div>
  );
};

export default ResourceCountRenderer;
