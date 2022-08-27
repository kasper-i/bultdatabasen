import { ResourceType } from "@/models/resource";
import { useChildren } from "@/queries/resourceQueries";
import { getResourceLabel, getResourceRoute } from "@/utils/resourceUtils";
import React, { Fragment, ReactElement } from "react";
import { Link } from "react-router-dom";
import Pill from "./Pill";
import SimpleTable from "./SimpleTable";

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
    <SimpleTable
      items={children.data
        .filter(
          (resource) =>
            filters?.types === undefined ||
            filters.types.includes(resource.type)
        )
        .map((resource) => {
          const label = getResourceLabel(resource.type);
          const url = getResourceRoute(resource.type, resource.id);

          return {
            key: resource.id,
            row: (
              <Link to={url}>
                <div className="w-[16rem] sm:w-[32rem] text-md truncate flex items-center">
                  {resource.name}
                  {(resource.counters?.openTasks ?? 0) > 0 && (
                    <Pill className="ml-2">{resource.counters?.openTasks}</Pill>
                  )}
                </div>
              </Link>
            ),
            badge: label,
          };
        })}
    />
  );
};

export default ChildrenTable;
