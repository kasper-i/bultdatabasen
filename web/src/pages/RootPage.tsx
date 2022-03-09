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
      <h1 className="text-5xl text-center font-bold">
        bult<span className="text-green-600 font-normal">databasen</span>
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
