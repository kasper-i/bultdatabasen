import React, { ReactElement } from "react";
import Breadcrumbs from "./Breadcrumbs";

interface Props {
  resourceId: string;
  resourceName: string;
}

const PageHeader = ({ resourceId, resourceName }: Props): ReactElement => {
  return (
    <div className="flex flex-col space-y-2.5">
      <Breadcrumbs resourceId={resourceId} resourceName={resourceName} />
      <h1 className="text-4xl font-bold">{resourceName}</h1>
    </div>
  );
};

export default PageHeader;
