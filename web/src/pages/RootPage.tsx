import React, { Fragment, ReactElement } from "react";
import { useAreas } from "queries/areaQueries";
import { Loader } from "semantic-ui-react";
import { useHistory } from "react-router";

function RootPage(): ReactElement {
  const areas = useAreas();
  const history = useHistory();

  if (areas.isLoading) {
    return <Loader />;
  }

  if (areas.data == null) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col">
      {areas.data.map((area) => (
        <div
          className="cursor-pointer"
          onClick={() => history.push(`/area/${area.id}`)}
          key={area.id}
        >
          {area.name}
        </div>
      ))}
    </div>
  );
}

export default RootPage;
