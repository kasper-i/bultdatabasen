import { useSelectedResource } from "@/contexts/SelectedResourceProvider";
import { Task, TaskStatus } from "@/models/task";
import { useDeleteTask, useUpdateTask } from "@/queries/taskQueries";
import React, { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import Restricted from "../../Restricted";

interface Props {
  task: Task;
}

const finalStatuses: TaskStatus[] = ["closed", "rejected"];

const TaskView = (props: Props): ReactElement => {
  const [task, setTask] = useState(props.task);

  const { selectedResource } = useSelectedResource();

  const ancestors = task.ancestors;
  const deleteTask = useDeleteTask(selectedResource.id, task.id);
  const updateTask = useUpdateTask(selectedResource.id, task.id);

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
      className="sm:w-96 flex flex-col space-y-2 bg-gray-50 p-5 rounded"
      key={task.id}
    >
      <div className="flex justify-between items-center">
        <Link to={`/route/${task.parentId}`}>
          <div className="flex flex-col">
            <div>
              {task.status === "closed" && (
                <Icon className="text-green-600" name="check" />
              )}
              {task.description}
            </div>
            <div className="text-sm text-gray-500">{routeName}</div>
          </div>
        </Link>
        <Restricted>
          <Button
            icon
            size="tiny"
            compact
            loading={deleteTask.isLoading}
            onClick={() => deleteTask.mutate()}
          >
            <Icon name="trash" />
          </Button>
        </Restricted>
      </div>

      <Restricted>
        <div className="flex space-x-2">
          <Button
            disabled={isComplete}
            size="small"
            fluid
            onClick={() => changeStatus("closed")}
          >
            <Icon name="check"></Icon> Utfört
          </Button>
        </div>
      </Restricted>
    </div>
  );
};

export default TaskView;
