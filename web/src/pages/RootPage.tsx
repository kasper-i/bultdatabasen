import { Concatenator } from "@/components/Concatenator";
import { rootNodeId } from "@/constants";
import { useAreas } from "@/queries/areaQueries";
import React from "react";

import { Link } from "react-router-dom";

const RootPage = () => {
  const { data: areas } = useAreas(rootNodeId);

  if (!areas) {
    return <></>;
  }

  return (
    <div className="flex flex-grow flex-col space-y-2.5">
      <h1 className="text-center text-4xl">
        <span className="text-transparent font-bold bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
          bult
        </span>
        databasen
      </h1>
      <p className="text-lg text-center">
        En databas över borrbultar i klätterområdena{" "}
        <Concatenator className="underline decoration-sky-500 decoration-2">
          {areas
            .filter((area) => area.parentId === rootNodeId)
            .map((area) => (
              <Link key={area.id} to={`/area/${area.id}`}>
                {area.name}
              </Link>
            ))}
        </Concatenator>
        .
      </p>
    </div>
  );
};

export default RootPage;
