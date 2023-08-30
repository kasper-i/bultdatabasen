import ChildrenTable from "@/components/ChildrenTable";
import { TaskAlert } from "@/components/features/task/TaskAlert";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { useCrag } from "@/queries/cragQueries";
import { Fragment, ReactElement } from "react";

const CragPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const { data: crag } = useCrag(resourceId);

  if (crag == null) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        ancestors={crag.ancestors}
        showCounts
      />

      <TaskAlert openTasks={crag.counters?.openTasks ?? 0} />

      <ChildrenTable
        resourceId={resourceId}
        filters={{ types: ["sector", "route"] }}
      />
    </div>
  );
};

export default CragPage;
