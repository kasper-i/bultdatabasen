import { ResourceType } from "@/models/resource";
import { useChildren } from "@/queries/resourceQueries";
import { getResourceLabel, getResourceRoute } from "@/utils/resourceUtils";
import { Anchor, Badge, Card, Group, Table, Title } from "@mantine/core";
import { Fragment, ReactElement } from "react";
import { Link } from "react-router-dom";
import Pill from "./Pill";
import classes from "./ChildrenTable.module.css";

interface Props {
  resourceId: string;
  filters?: { types: ResourceType[] };
  className?: string;
}

const ChildrenTable = ({
  resourceId,
  filters,
  className,
}: Props): ReactElement => {
  const children = useChildren(resourceId);

  if (children.data == null) {
    return <Fragment />;
  }

  return (
    <Card withBorder className={className}>
      <Table>
        <Table.Tbody>
          {children.data
            .filter(
              (resource) =>
                filters?.types === undefined ||
                filters.types.includes(resource.type)
            )
            .map((resource) => {
              const label = getResourceLabel(resource.type);
              const url = getResourceRoute(resource.type, resource.id);

              return (
                <Table.Tr key={resource.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <Anchor component={Link} to={url}>
                        {resource.name}
                      </Anchor>
                      {(resource.counters?.openTasks ?? 0) > 0 && (
                        <Pill>{resource.counters?.openTasks}</Pill>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td ta="end">
                    <Badge className={classes.badge} size="sm" color="gray">
                      {label}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
        </Table.Tbody>
      </Table>
    </Card>
  );
};

export default ChildrenTable;
