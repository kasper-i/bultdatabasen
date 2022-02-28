import { Resource } from "@/models/resource";
import React, { ReactElement } from "react";
import { useHistory } from "react-router";
import { Breadcrumb, StrictBreadcrumbSectionProps } from "semantic-ui-react";
import { SemanticShorthandCollection } from "semantic-ui-react/dist/commonjs/generic";

interface Props {
  resourceId: string;
  resourceName: string;
  ancestors?: Resource[];
}

const Breadcrumbs = ({
  resourceId,
  resourceName,
  ancestors,
}: Props): ReactElement => {
  const history = useHistory();

  const crumbs: SemanticShorthandCollection<StrictBreadcrumbSectionProps> = (
    ancestors ?? []
  ).map((ancestor) => ({
    key: ancestor.id,
    content: ancestor.type === "root" ? "🌎" : ancestor.name,
    onClick: () => {
      switch (ancestor.type) {
        case "root":
          history.push("/");
          break;
        case "area":
          history.push(`/area/${ancestor.id}`);
          break;
        case "crag":
          history.push(`/crag/${ancestor.id}`);
          break;
        case "sector":
          history.push(`/sector/${ancestor.id}`);
          break;
        case "route":
          history.push(`/route/${ancestor.id}`);
          break;
      }
    },
  }));

  crumbs.push({
    key: resourceId,
    content: resourceName,
  });

  return (
    <div className="h-5 flex items-center">
      <Breadcrumb icon="right angle" sections={crumbs} />
    </div>
  );
};

export default Breadcrumbs;
