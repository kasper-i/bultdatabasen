import React, { Fragment, ReactElement } from "react";
import { useChildren } from "@/queries/commonQueries";
import { useHistory } from "react-router";
import { getResourceLabel, getResourceUrl } from "@/utils/resourceUtils";

interface Props {
  resourceId: string;
}

const ChildrenTable = ({ resourceId }: Props): ReactElement => {
  const children = useChildren(resourceId);
  const history = useHistory();

  if (children.data == null) {
    return <Fragment />;
  }

  return (
    <div>
      <ul>
        {children.data.map((resource) => {
          const label = getResourceLabel(resource.type);
          const url = getResourceUrl(resource.type, resource.id);
          return (
            <li
              key={resource.id}
              className="cursor-pointer"
              onClick={() => url && history.push(url)}
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
