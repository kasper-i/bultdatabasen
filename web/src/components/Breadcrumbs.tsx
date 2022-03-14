import { Resource } from "@/models/resource";
import React, { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/solid";

interface Props {
  resourceId: string;
  resourceName: string;
  ancestors?: Resource[];
}

interface Crumb {
  key: string;
  content: ReactNode;
}

const Breadcrumbs = ({
  resourceId,
  resourceName,
  ancestors,
}: Props): ReactElement => {
  const crumbs: Crumb[] = (ancestors ?? []).map((ancestor) => {
    let to = "";

    switch (ancestor.type) {
      case "root":
        to = "/";
        break;
      case "area":
        to = `/area/${ancestor.id}`;
        break;
      case "crag":
        to = `/crag/${ancestor.id}`;
        break;
      case "sector":
        to = `/sector/${ancestor.id}`;
        break;
      case "route":
        to = `/route/${ancestor.id}`;
        break;
    }

    return {
      key: ancestor.id,
      content: (
        <Link to={to}>{ancestor.type === "root" ? "🌎" : ancestor.name}</Link>
      ),
    };
  });

  crumbs.reverse();

  crumbs.push({
    key: resourceId,
    content: resourceName,
  });

  return (
    <div className="h-5 flex items-center">
      {crumbs.map(({ key, content }, index) => (
        <div key={key} className="flex items-center">
          {content}
          {index !== crumbs.length - 1 && (
            <ChevronRightIcon className="mx-0.5 h-4 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
