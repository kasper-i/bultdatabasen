import { Api } from "@/Api";
import { Time } from "@/components/atoms/Time";
import DeleteDialog from "@/components/molecules/DeleteDialog";
import UserName from "@/components/UserName";
import { Point } from "@/models/point";
import { Resource } from "@/models/resource";
import { Task, TaskStatus } from "@/models/task";
import { useDeleteTask, useTask, useUpdateTask } from "@/queries/taskQueries";
import { emptyArray } from "@/utils/constants";
import { getResourceRoute } from "@/utils/resourceUtils";
import { translatePriority } from "@/utils/taskUtils";
import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Card,
  Group,
  Menu,
  Pill,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconClipboardCheck,
  IconEdit,
  IconMenu2,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash-es";
import { FC, Fragment, ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import Restricted from "../../Restricted";
import { usePointLabeler } from "../routeEditor/hooks";
import TaskEdit from "./TaskEdit";
import classes from "./TaskView.module.css";

const finalStatuses: TaskStatus[] = ["closed", "rejected"];

const CompleteButton: FC<{
  onComplete: (args: Pick<Task, "comment" | "closedAt">) => void;
  loading: boolean;
}> = ({ onComplete, loading }) => {
  const [phase, setPhase] = useState<number>(1);
  const [comment, setComment] = useState("");
  const [closedAt, setClosedAt] = useState(new Date());

  return (
    <Stack gap="sm">
      {phase === 2 && (
        <>
          <TextInput
            label="Kommentar"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            size="sm"
          />
          <DatePickerInput
            label="Datum"
            value={closedAt}
            onChange={(date) => setClosedAt(date ?? new Date())}
            required
          />
        </>
      )}
      <Group justify="end">
        {phase === 2 && (
          <Button
            onClick={() => setPhase(1)}
            variant="subtle"
            disabled={loading}
          >
            Avbryt
          </Button>
        )}
        <Button
          onClick={() =>
            phase === 1
              ? setPhase(2)
              : onComplete({
                  comment: comment.trim(),
                  closedAt: closedAt,
                })
          }
          leftSection={<IconClipboardCheck size={14} />}
          loading={loading}
          disabled={phase === 2 && isEmpty(comment.trim())}
          variant="light"
          fullWidth={phase === 1}
        >
          Markera åtgärdad
        </Button>
      </Group>
    </Stack>
  );
};

const PriorityPill: FC<{ priority: number }> = ({ priority }) => {
  const props = (() => {
    switch (priority) {
      case 1:
        return { bg: "red", c: "white" };
      case 3:
        return {};
    }
  })();

  if (priority === 2) {
    return <Fragment />;
  }

  return (
    <Pill {...props} size="xs" className={classes.pill}>
      {translatePriority(priority)}
    </Pill>
  );
};

const TaskView: FC<{
  taskId: string;
  parentResourceId: string;
}> = ({ taskId, parentResourceId }): ReactElement => {
  const { data: task } = useTask(taskId);

  const ancestors = task?.ancestors;
  const deleteTask = useDeleteTask(taskId);
  const updateTask = useUpdateTask(taskId);

  const [action, setAction] = useState<"delete" | "edit">();

  let parent = ancestors
    ?.slice()
    .reverse()
    ?.filter((ancestor) =>
      ["area", "crag", "sector", "route"].includes(ancestor.type)
    )?.[0];
  const pointId = ancestors?.find(({ type }) => type === "point")?.id;
  let route: Resource | undefined;

  if (pointId) {
    route = ancestors?.find(
      ({ id, type }) => type === "route" && id === parentResourceId
    );
    if (route) {
      parent = route;
    }
  }

  const { data: points } = useQuery<Point[]>(
    ["points", { resourceId: route?.id }],
    () => Api.getPoints(route?.id ?? ""),
    {
      enabled: !!route?.id,
    }
  );

  const pointLabeler = usePointLabeler(points ?? emptyArray);

  if (!task || !parent) {
    return <></>;
  }

  const changeStatus = (status: TaskStatus) => {
    const updatedTask = { ...task, status };
    updateTask.mutate(updatedTask);
    return updatedTask;
  };

  const complete = (args: Pick<Task, "comment" | "closedAt">) => {
    const { comment, closedAt } = args;
    const updatedTask: Task = { ...task, status: "closed", comment, closedAt };
    updateTask.mutate(updatedTask);
    return updatedTask;
  };

  const isComplete = finalStatuses.includes(task.status);

  const { name: pointName, no: pointNo } = pointLabeler(pointId ?? "");

  return (
    <Card withBorder>
      <Group justify="space-between" wrap="nowrap" align="start">
        <span>
          <Text size="sm">
            {!isComplete && translatePriority(task.priority) && (
              <PriorityPill priority={task.priority} />
            )}
            <Anchor
              component={Link}
              to={`${getResourceRoute(parent.type, parent.id)}${
                pointId ? `?p=${pointId}` : ""
              }`}
            >
              {parent?.name}
            </Anchor>
          </Text>
          {pointNo && (
            <Text size="xs" c="dimmed">
              {pointName} {pointNo}
            </Text>
          )}
          <Text c="dimmed" size="xs">
            Rapporterat <Time time={task.createdAt} /> av{" "}
            <UserName user={task.author} />
          </Text>
        </span>
        <Restricted>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="light">
                <IconMenu2 size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => setAction("edit")}
                disabled={isComplete}
              >
                Redigera
              </Menu.Item>
              <Menu.Item
                leftSection={<IconRefresh size={14} />}
                onClick={() => changeStatus("open")}
                disabled={!isComplete}
              >
                Återöppna
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => setAction("delete")}
              >
                Radera
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Restricted>
      </Group>

      <Space h="sm" />

      {action === "edit" ? (
        <TaskEdit task={task} onDone={() => setAction(undefined)} />
      ) : (
        <Text className={classes.description} size="sm" fw={500}>
          Problem:{" "}
          <Text component="span" size="sm">
            {task.description}
          </Text>
        </Text>
      )}

      {action !== "edit" && (
        <Card.Section
          className={classes.section}
          withBorder
          data-status={task.status}
        >
          {isComplete ? (
            <Box>
              <>
                <Text fw={600} size="sm">
                  {task.status === "closed" ? "Åtgärdat" : "Avvisad"}
                </Text>
                <Text size="xs">
                  {task.closedAt && <Time time={task.closedAt} />}
                </Text>
              </>
              {task.comment && (
                <>
                  <Space h="sm" />

                  <Text size="sm" fw={500}>
                    Kommentar:{" "}
                    <Text component="span" size="sm">
                      {task.comment}
                    </Text>
                  </Text>
                </>
              )}
            </Box>
          ) : (
            <Restricted>
              <>
                <CompleteButton
                  loading={updateTask.isLoading}
                  onComplete={complete}
                />
              </>
            </Restricted>
          )}
        </Card.Section>
      )}
      {action === "delete" && (
        <DeleteDialog
          mutation={deleteTask}
          target="uppdraget"
          onClose={() => setAction(undefined)}
        />
      )}
    </Card>
  );
};

export default TaskView;
