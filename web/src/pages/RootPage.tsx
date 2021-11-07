import ChildrenTable from "@/components/ChildrenTable";
import { useSelectedResource } from "@/contexts/SelectedResourceProvider";
import React, { ReactElement, useEffect } from "react";

function RootPage(): ReactElement {
  const { updateSelectedResource } = useSelectedResource();

  useEffect(() => {
    updateSelectedResource({
      id: "7ea1df97-df3a-436b-b1d2-b211f1b9b363",
      type: "root",
    });
  }, [updateSelectedResource]);

  return (
    <div className="flex flex-grow flex-col space-y-2.5">
      <h1 className="text-5xl text-center">Bultdatabasen</h1>
      <p className="italic text-lg text-center">
        En databas över expansionsbultar, limbultar, ankare, etc.
      </p>
      <ChildrenTable resourceId={"7ea1df97-df3a-436b-b1d2-b211f1b9b363"} />
    </div>
  );
}

export default RootPage;
