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
import { ActionIcon, Button, Menu, TextInput } from "@mantine/core";
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
    <div className="flex flex-col gap-2">
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
      <div className="flex justify-end gap-2 mt-2">
        {phase === 2 && (
          <Button
            onClick={() => setPhase(1)}
            variant="outline"
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
          fullWidth
        >
          Markera åtgärdad
        </Button>
      </div>
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
    <div className="w-full sm:w-96 flex flex-col space-y-2.5 bg-white shadow-sm p-5 rounded border border-gray-300">
      <div className="relative flex justify-between items-start">
        <Link
          to={`${getResourceRoute(parent.type, parent.id)}${
            pointId ? `?p=${pointId}` : ""
          }`}
          className="w-full pr-5"
        >
          <div className="text-sm">
            <span className="inline-flex items-center gap-1">
              {translatePriority(task.priority) && (
                <span
                  className={clsx(
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
              {parent?.name}
            </span>
            {pointNo && (
              <span className="ml-1 text-gray-500 text-xs">
                {pointName} {pointNo}
              </span>
            )}
          </div>
          <div className="text-xs mt-0.5">
            Rapporterat{" "}
            <span className="font-medium">
              <Time time={task.createdAt} />
            </span>{" "}
            av <UserName user={task.author} />
          </div>
        </Link>
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
      </div>

      {action === "edit" ? (
        <TaskEdit task={task} onDone={() => setAction(undefined)} />
      ) : (
        <>
          <p className="text-sm">{task.description}</p>

          {isComplete ? (
            <>
              <hr className="-mx-5 pb-2" />

              <div className="flex flex-col">
                <div className="flex items-center">
                  <IconCheck
                    className={clsx(
                      task.status === "closed"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  />
                  <p
                    className={clsx(
                      task.status === "closed"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  >
                    <span className="text-sm ml-1 font-semibold">
                      {task.status === "closed" ? "Åtgärdat" : "Stängd"}
                    </span>{" "}
                    {task.closedAt && <Time time={task.closedAt} />}
                  </p>
                </div>
                {task.comment && (
                  <p className="text-sm text-gray-700">
                    <IconMessage name="comment" className="mr-1" />
                    {task.comment}
                  </p>
                )}
              </div>
            </>
          ) : (
            <Restricted>
              <>
                <hr className="-mx-5 pb-2" />

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
    </div>
  );
};

export default TaskView;
