import { Api } from "@/Api";
import UserName from "@/components/UserName";
import { Time } from "@/components/atoms/Time";
import DeleteDialog from "@/components/molecules/DeleteDialog";
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
  Button,
  Card,
  Group,
  Menu,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconCheck,
  IconClipboardCheck,
  IconEdit,
  IconMenu2,
  IconMessage,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { isEmpty } from "lodash-es";
import { FC, ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import Restricted from "../../Restricted";
import { usePointLabeler } from "../routeEditor/hooks";
import TaskEdit from "./TaskEdit";

const finalStatuses: TaskStatus[] = ["closed", "rejected"];

const CompleteButton: FC<{
  onComplete: (args: Pick<Task, "comment" | "closedAt">) => void;
  loading: boolean;
}> = ({ onComplete, loading }) => {
  const [phase, setPhase] = useState<number>(1);
  const [comment, setComment] = useState("");
  const [closedAt, setClosedAt] = useState(new Date());

  return (
    <div data-tailwind="flex flex-col gap-2">
      {phase === 2 && (
        <>
          <TextInput
            label="Kommentar"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
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
          variant="filled"
        >
          Markera åtgärdad
        </Button>
      </Group>
    </div>
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
      <Group justify="space-between">
        <span>
          <span data-tailwind="inline-flex items-center gap-1">
            {translatePriority(task.priority) && (
              <span
                data-tailwind={clsx(
                  "text-xs font-medium text-white rounded-md py-0.5 px-1.5",
                  task.priority === 1
                    ? "bg-red-500"
                    : task.priority === 3
                    ? "bg-gray-500"
                    : undefined
                )}
              >
                {translatePriority(task.priority)}
              </span>
            )}
            <Anchor
              size="sm"
              component={Link}
              to={`${getResourceRoute(parent.type, parent.id)}${
                pointId ? `?p=${pointId}` : ""
              }`}
            >
              {parent?.name}
            </Anchor>
          </span>
          {pointNo && (
            <span data-tailwind="ml-1 text-gray-500 text-xs">
              {pointName} {pointNo}
            </span>
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
                Redigera
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Restricted>
      </Group>

      {action === "edit" ? (
        <TaskEdit task={task} onDone={() => setAction(undefined)} />
      ) : (
        <>
          <p data-tailwind="text-sm">{task.description}</p>

          {isComplete ? (
            <>
              <hr data-tailwind="-mx-5 pb-2" />

              <div data-tailwind="flex flex-col">
                <div data-tailwind="flex items-center">
                  <IconCheck
                    data-tailwind={clsx(
                      task.status === "closed"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  />
                  <p
                    data-tailwind={clsx(
                      task.status === "closed"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  >
                    <span data-tailwind="text-sm ml-1 font-semibold">
                      {task.status === "closed" ? "Åtgärdat" : "Stängd"}
                    </span>{" "}
                    {task.closedAt && <Time time={task.closedAt} />}
                  </p>
                </div>
                {task.comment && (
                  <p data-tailwind="text-sm text-gray-700">
                    <IconMessage name="comment" data-tailwind="mr-1" />
                    {task.comment}
                  </p>
                )}
              </div>
            </>
          ) : (
            <Restricted>
              <>
                <hr data-tailwind="-mx-5 pb-2" />

                <CompleteButton
                  loading={updateTask.isLoading}
                  onComplete={complete}
                />
              </>
            </Restricted>
          )}
        </>
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
