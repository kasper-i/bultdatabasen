import ChildrenTable from "@/components/ChildrenTable";
import { TaskAlert } from "@/components/features/task/TaskAlert";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { useArea } from "@/queries/areaQueries";
import { Fragment, ReactElement } from "react";

const AreaPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const { data: area } = useArea(resourceId);

  if (!area) {
    return <Fragment />;
  }

  return (
    <div data-tailwind="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        ancestors={area.ancestors}
        showCounts
      />

      <TaskAlert openTasks={area.counters?.openTasks ?? 0} />

      <ChildrenTable
        resourceId={resourceId}
        filters={{ types: ["area", "crag", "route"] }}
      />
    </div>
  );
};

export default AreaPage;
