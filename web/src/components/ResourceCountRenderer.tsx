import { ResourceCount } from "models/resource";
import React, { ReactElement } from "react";

interface Props {
  label: string;
  count: number;
}

const ResourceCountRenderer = ({ label, count }: Props): ReactElement => {
  return (
    <div className="flex flex-col">
      <h1 className="text-4xl font-bold">{count}</h1>
      <p className="text-sm">{label}</p>
    </div>
  );
};

export default ResourceCountRenderer;
