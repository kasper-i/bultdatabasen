import ChildrenTable from "@/components/ChildrenTable";
import PageHeader from "@/components/PageHeader";
import Restricted from "@/components/Restricted";
import { TaskAlert } from "@/components/features/task/TaskAlert";
import { useUnsafeParams } from "@/hooks/common";
import { useSector } from "@/queries/sectorQueries";
import { Button, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Fragment, ReactElement } from "react";
import { Link } from "react-router-dom";
import classes from "./SectorPage.module.css";

const SectorPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const { data: sector } = useSector(resourceId);

  if (!sector) {
    return <Fragment />;
  }

  return (
    <Stack gap="sm" className={classes.container}>
      <PageHeader
        resourceId={resourceId}
        ancestors={sector.ancestors}
        showCounts
      />

      <TaskAlert openTasks={sector.counters?.openTasks ?? 0} />

      <Restricted>
        <Link to="new-route" className={classes.toolbar}>
          <Button leftSection={<IconPlus size={14} />}>Ny led</Button>
        </Link>
      </Restricted>
      <ChildrenTable resourceId={resourceId} filters={{ types: ["route"] }} />
    </Stack>
  );
};

export default SectorPage;
