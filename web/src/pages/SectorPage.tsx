import Button from "@/components/atoms/Button";
import ChildrenTable from "@/components/ChildrenTable";
import { TaskAlert } from "@/components/features/task/TaskAlert";
import PageHeader from "@/components/PageHeader";
import Restricted from "@/components/Restricted";
import { useUnsafeParams } from "@/hooks/common";
import { useSector } from "@/queries/sectorQueries";
import { Fragment, ReactElement } from "react";
import { Link } from "react-router-dom";

const SectorPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const { data: sector } = useSector(resourceId);

  if (!sector) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        ancestors={sector.ancestors}
        showCounts
      />
      {sector?.counters?.openTasks && (
        <TaskAlert openTasks={sector.counters.openTasks} />
      )}
      <Restricted>
        <div className="flex justify-end">
          <Link to="new-route">
            <Button icon="plus">Ny led</Button>
          </Link>
        </div>
      </Restricted>
      <ChildrenTable resourceId={resourceId} filters={{ types: ["route"] }} />
    </div>
  );
};

export default SectorPage;
