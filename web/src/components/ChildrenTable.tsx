import { ResourceType } from "@/models/resource";
import { useChildren } from "@/queries/resourceQueries";
import { getResourceLabel, getResourceRoute } from "@/utils/resourceUtils";
import { Anchor, Badge, Group, Table } from "@mantine/core";
import { Fragment, ReactElement } from "react";
import { Link } from "react-router-dom";
import Pill from "./Pill";

interface Props {
  resourceId: string;
  filters?: { types: ResourceType[] };
}

const ChildrenTable = ({ resourceId, filters }: Props): ReactElement => {
  const children = useChildren(resourceId);

  if (children.data == null) {
    return <Fragment />;
  }

  return (
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
                  <Group>
                    <Anchor component={Link} to={url}>
                      {resource.name}
                    </Anchor>
                    <div>
                      {(resource.counters?.openTasks ?? 0) > 0 && (
                        <Pill>{resource.counters?.openTasks}</Pill>
                      )}
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td ta="end">
                  <Badge size="sm" color="gray">
                    {label}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            );
          })}
      </Table.Tbody>
    </Table>
  );
};

export default ChildrenTable;
