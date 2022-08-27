import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Time } from "@/components/atoms/Time";
import DeleteDialog from "@/components/molecules/DeleteDialog";
import { Menu } from "@/components/molecules/Menu";
import UserName from "@/components/UserName";
import { TaskStatus } from "@/models/task";
import { useDeleteTask, useTask, useUpdateTask } from "@/queries/taskQueries";
import { getResourceRoute } from "@/utils/resourceUtils";
import clsx from "clsx";
import React, { FC, ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import Restricted from "../../Restricted";
import TaskEdit from "./TaskEdit";

const finalStatuses: TaskStatus[] = ["closed", "rejected"];

const TaskView: FC<{
  taskId: string;
}> = ({ taskId }): ReactElement => {
  const { data: task } = useTask(taskId);

  const ancestors = task?.ancestors;
  const deleteTask = useDeleteTask(taskId);
  const updateTask = useUpdateTask(taskId);

  const [action, setAction] = useState<"delete" | "edit">();

  const parent = ancestors?.filter((ancestor) =>
    ["area", "crag", "sector", "route"].includes(ancestor.type)
  )?.[0];

  if (!task || !parent) {
    return <></>;
  }

  const changeStatus = (status: TaskStatus) => {
    const updatedTask = { ...task, status };
    updateTask.mutate(updatedTask);
    return updatedTask;
  };

  const isComplete = finalStatuses.includes(task.status);

  return (
    <div className="w-full sm:w-96 flex flex-col space-y-2.5 bg-white shadow-sm p-5 rounded border border-gray-300">
      <div className="relative flex justify-between items-center">
        <Link
          to={getResourceRoute(parent.type, parent.id)}
          className="w-full pr-5"
        >
          <div className="text-sm text-gray-500 truncate">{parent?.name}</div>
        </Link>
        <Restricted>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Menu
              items={[
                {
                  label: "Redigera",
                  icon: "edit",
                  disabled: isComplete,
                  onClick: () => setAction("edit"),
                },
                {
                  label: "Återöppna",
                  icon: "refresh",
                  disabled: !isComplete,
                  onClick: () => changeStatus("open"),
                },
                {
                  label: "Radera",
                  icon: "trash",
                  className: "text-red-500",
                  onClick: () => setAction("delete"),
                },
              ]}
            />
          </div>
        </Restricted>
      </div>

      <div className="text-xs">
        Rapporterat{" "}
        <span className="font-medium">
          <Time time={task.createdAt} />
        </span>{" "}
        av <UserName userId={task.userId} />
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
                  <Icon
                    className={clsx(
                      task.status === "closed"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                    name="check"
                  />
                  <p
                    className={clsx(
                      task.status === "closed"
                        ? "text-green-600"
                        : "text-red-500"
                    )}
                  >
                    <span className="ml-1 font-bold">
                      {task.status === "closed" ? "Åtgärdat" : "Stängd"}
                    </span>{" "}
                    {task.closedAt && <Time time={task.closedAt} />}
                  </p>
                </div>
                {task.comment && (
                  <p className="text-sm text-gray-700">
                    <Icon name="comment" className="mr-1" />
                    {task.comment}
                  </p>
                )}
              </div>
            </>
          ) : (
            <Restricted>
              <>
                <hr className="-mx-5 pb-2" />

                <Button
                  onClick={() => changeStatus("closed")}
                  icon="check badge"
                  full
                  loading={updateTask.isLoading}
                >
                  Markera åtgärdad
                </Button>
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
