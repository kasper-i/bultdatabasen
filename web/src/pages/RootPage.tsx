import ChildrenTable from "@/components/ChildrenTable";
import Search from "@/components/Search";
import { rootNodeId } from "@/constants";
import React from "react";

const RootPage = () => {
  return (
    <div className="flex flex-grow flex-col items-center">
      <h1 className="text-center text-4xl leading-tight">
        <span className="text-transparent font-bold bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300">
          bult
        </span>
        databasen
      </h1>
      <p className="text-md text-center text-gray-700">
        En databas över borrbultar och ankare på klätterleder i Västsverige.
      </p>
      <div className="mt-5 w-full mb-5">
        <Search />
      </div>
      <ChildrenTable resourceId={rootNodeId} filters={{ types: ["area"] }} />
      {
        <button
          onClick={() => {
            throw Error("Boom!");
          }}
        >
          Break the world
        </button>
      }
    </div>
  );
};

export default RootPage;
