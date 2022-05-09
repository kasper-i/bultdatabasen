import { ResourceType } from "@/models/resource";
import { useChildren } from "@/queries/resourceQueries";
import { getResourceLabel, getResourceRoute } from "@/utils/resourceUtils";
import React, { Fragment, ReactElement } from "react";
import { Link } from "react-router-dom";

interface Props {
  resourceId: string;
  filters?: { types: ResourceType[] };
}

const ChildrenTable = ({ resourceId, filters }: Props): ReactElement => {
  const children = useChildren(resourceId);

  if (children.data == null) {
    return <Fragment />;
  }

  return (
    <div>
      <ul className="divide-y">
        {children.data
          .filter(
            (resource) =>
              filters?.types === undefined ||
              filters.types.includes(resource.type)
          )
          .map((resource) => {
            const label = getResourceLabel(resource.type);
            const url = getResourceRoute(resource.type, resource.id);
            return (
              <li
                key={resource.id}
                className="flex justify-between items-center py-1.5"
              >
                <Link to={url}>
                  <div className="w-[16rem] sm:w-[32rem] text-md truncate">
                    {resource.name}
                  </div>
                </Link>

                <span className="bg-primary-400 rounded-full py-1 px-2 text-xs text-white">
                  {label}
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default ChildrenTable;
