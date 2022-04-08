import { ResourceType } from "@/models/resource";
import { useChildren } from "@/queries/resourceQueries";
import { getResourceLabel, getResourceRoute } from "@/utils/resourceUtils";
import React, { Fragment, ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  resourceId: string;
  filters?: { types: ResourceType[] };
}

const ChildrenTable = ({ resourceId, filters }: Props): ReactElement => {
  const children = useChildren(resourceId);
  const navigate = useNavigate();

  if (children.data == null) {
    return <Fragment />;
  }

  return (
    <div>
      <ul>
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
                className="cursor-pointer"
                onClick={() => url && navigate(url)}
              >
                <div className="flex justify-start items-center my-1.5 gap-2.5">
                  <span className="text-xl">{resource.name}</span>
                  <span className="bg-primary-400 rounded-full py-1 px-2 text-xs text-white">
                    {label}
                  </span>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default ChildrenTable;
