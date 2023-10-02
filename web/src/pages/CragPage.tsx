import ChildrenTable from "@/components/ChildrenTable";
import { TaskAlert } from "@/components/features/task/TaskAlert";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { useCrag } from "@/queries/cragQueries";
import { Stack } from "@mantine/core";
import { Fragment, ReactElement } from "react";

const CragPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const { data: crag } = useCrag(resourceId);

  if (crag == null) {
    return <Fragment />;
  }

  return (
    <Stack>
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
    </Stack>
  );
};

export default CragPage;
