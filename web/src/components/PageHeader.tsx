import { Concatenator } from "@/components/Concatenator";
import { useMaintainers, useResource } from "@/queries/resourceQueries";
import { Card, Group, Space, Stack, Text, Title } from "@mantine/core";
import { IconTool } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { Counter } from "./Counter";
import classes from "./PageHeader.module.css";
import Restricted from "./Restricted";
import { Resource } from "@/models/resource";

const PageHeader: FC<{
  resourceId: string;
  ancestors?: Resource[];
  showCounts?: boolean;
  menu?: ReactNode;
  children?: ReactNode;
}> = ({ resourceId, ancestors, showCounts = false, menu, children }) => {
  const { data: resource } = useResource(resourceId);
  const { data: maintainers } = useMaintainers(resourceId);

  if (!resource) {
    return <></>;
  }

  const crumbs = ancestors?.slice();
  const onlyRoot = crumbs?.length === 1 && crumbs[0].type === "root";

  return (
    <>
      {crumbs && !onlyRoot && <Breadcrumbs resources={crumbs} />}
      <Card bg="brand.4" c="white">
        <Stack gap={0}>
          <Group justify="space-between" wrap="nowrap">
            <Title order={3} className={classes.title}>
              {resource.name}
            </Title>
            <Restricted>{menu}</Restricted>
          </Group>

          <Text className={classes.maintainer}>
            <IconTool size={14} />
            {maintainers?.length ? (
              <Concatenator>
                {maintainers?.map((maintainer) => (
                  <span key={maintainer.id}>{maintainer.name}</span>
                ))}
              </Concatenator>
            ) : (
              <span>Underhållsansvarig saknas</span>
            )}
          </Text>

          <Space h="sm" />

          {showCounts && (
            <Group>
              <Counter
                label="Bultar"
                count={resource.counters?.installedBolts ?? 0}
              />
              <Counter label="Leder" count={resource.counters?.routes ?? 0} />
            </Group>
          )}

          {children}
        </Stack>
      </Card>
    </>
  );
};

export default PageHeader;
