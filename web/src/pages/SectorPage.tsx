import Button from "@/components/atoms/Button";
import ChildrenTable from "@/components/ChildrenTable";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { useSector } from "@/queries/sectorQueries";
import { Fragment, ReactElement } from "react";
import { Link } from "react-router-dom";

const SectorPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const sector = useSector(resourceId);

  if (!sector.data) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        ancestors={sector.data.ancestors}
        showCounts
      />
      <div className="flex justify-end">
        <Link to="new">
          <Button icon="plus">Ny led</Button>
        </Link>
      </div>
      <ChildrenTable resourceId={resourceId} filters={{ types: ["route"] }} />
    </div>
  );
};

export default SectorPage;
