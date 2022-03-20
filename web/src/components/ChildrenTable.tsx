import { useChildren } from "@/queries/resourceQueries";
import { getResourceLabel, getResourceRoute } from "@/utils/resourceUtils";
import React, { Fragment, ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  resourceId: string;
}

const ChildrenTable = ({ resourceId }: Props): ReactElement => {
  const children = useChildren(resourceId);
  const navigate = useNavigate();

  if (children.data == null) {
    return <Fragment />;
  }

  return (
    <div>
      <ul>
        {children.data.map((resource) => {
          const label = getResourceLabel(resource.type);
          const url = getResourceRoute(resource.type, resource.id);
          return (
            <li
              key={resource.id}
              className="cursor-pointer"
              onClick={() => url && navigate(url)}
            >
              <div className="flex justify-start items-center my-1.5">
                <span className="text-xl">{resource.name}</span>
                <span className="bg-green-400 rounded-lg p-1.5 text-xs ml-2.5">
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
