import { Concatenator } from "@/components/Concatenator";
import { useMaintainers, useResource } from "@/queries/resourceQueries";
import { Card, Group, Space, Stack, Text, Title } from "@mantine/core";
import { IconTool } from "@tabler/icons-react";
import { FC, ReactNode, useMemo } from "react";
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
  className?: string;
}> = ({
  resourceId,
  ancestors,
  showCounts = false,
  menu,
  children,
  className,
}) => {
  const { data: resource } = useResource(resourceId);
  const { data: maintainers } = useMaintainers(resourceId);

  if (!resource) {
    return <></>;
  }

  const crumbs = useMemo(() => {
    const crumbs = ancestors?.slice();
    if (resource) {
      crumbs?.push(resource);
    }

    return crumbs;
  }, [ancestors, resource]);

  const onlyRoot = crumbs?.length === 1 && crumbs[0].type === "root";

  return (
    <Stack gap="sm" className={className}>
      {crumbs && !onlyRoot && <Breadcrumbs resources={crumbs} />}
      <Card bg="brand.4" c="white">
        <Stack gap={0}>
          <Group justify="space-between" wrap="nowrap">
            <Title order={3} className={classes.title}>
              {resource.name}
            </Title>
            <Restricted>{menu}</Restricted>
          </Group>

          <Text size="sm" className={classes.maintainer}>
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
    </Stack>
  );
};

export default PageHeader;
