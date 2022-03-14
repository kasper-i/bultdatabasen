import Button from "@/components/base/Button";
import Icon from "@/components/base/Icon";
import IconButton from "@/components/base/IconButton";
import { Task, TaskStatus } from "@/models/task";
import { useDeleteTask, useUpdateTask } from "@/queries/taskQueries";
import React, { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import Restricted from "../../Restricted";

interface Props {
  task: Task;
  resourceId: string;
}

const finalStatuses: TaskStatus[] = ["closed", "rejected"];

const TaskView = ({ resourceId, ...rest }: Props): ReactElement => {
  const [task, setTask] = useState(rest.task);

  const ancestors = task.ancestors;
  const deleteTask = useDeleteTask(resourceId, task.id);
  const updateTask = useUpdateTask(resourceId, task.id);

  const changeStatus = (status: TaskStatus) => {
    setTask((task) => {
      const updatedTask = { ...task, status };
      updateTask.mutate(updatedTask);
      return updatedTask;
    });
  };

  const routeName =
    ancestors?.find((ancestor) => ancestor.type === "route")?.name ?? "";

  const isComplete = finalStatuses.includes(task.status);

  return (
    <div
      className="sm:w-96 flex flex-col space-y-2 bg-gray-200 p-5 rounded"
      key={task.id}
    >
      <div className="flex justify-between items-center">
        <Link to={`/route/${task.parentId}`}>
          <div className="flex flex-col">
            <div className="flex items-center">
              {task.status === "closed" && (
                <Icon className="text-green-600" name="check" />
              )}
              {task.description}
            </div>
            <div className="text-sm text-gray-500">{routeName}</div>
          </div>
        </Link>
        <Restricted>
          <IconButton
            color="danger"
            loading={deleteTask.isLoading}
            onClick={() => deleteTask.mutate()}
            icon="trash"
          />
        </Restricted>
      </div>

      <Restricted>
        <div className="flex space-x-2">
          <Button
            disabled={isComplete}
            onClick={() => changeStatus("closed")}
            icon="check"
            full
          >
            Utfört
          </Button>
        </div>
      </Restricted>
    </div>
  );
};

export default TaskView;
