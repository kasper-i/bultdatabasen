import React, { Fragment, ReactElement } from "react";
import { useChildren } from "queries/commonQueries";
import { useHistory } from "react-router";

interface Props {
  resourceId: string;
}

function ChildrenTable({ resourceId }: Props): ReactElement {
  const children = useChildren(resourceId);
  const history = useHistory();

  if (children.data == null) {
    return <Fragment />;
  }

  return (
    <div>
      <ul>
        {children.data.map((resource) => (
          <li
            className="cursor-pointer"
            onClick={() => history.push(`/${resource.type}/${resource.id}`)}
          >
            {resource.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChildrenTable;
