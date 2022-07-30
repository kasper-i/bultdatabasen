import { Task } from "@/models/task";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api, GetTasksOptions } from "../Api";

export const useTasks = (parentId: string, options: GetTasksOptions) => {
  return useQuery(["tasks", { parentId, options }], () =>
    Api.getTasks(parentId, options)
  );
};

export const useTask = (taskId: string) =>
  useQuery(["task", { taskId }], () => Api.getTask(taskId));

export const useCreateTask = (parentId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (task: Pick<Task, "description">) => Api.createTask(parentId, task),
    {
      onSuccess: async (data) => {
        queryClient.refetchQueries(["task", { taskId: data.id }]);
        queryClient.refetchQueries(["tasks", { parentId }], {
          stale: true,
          exact: false,
        });
      },
    }
  );
};

export const useUpdateTask = (parentId: string, taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation((task: Task) => Api.updateTask(taskId, task), {
    onSuccess: async (data) => {
      queryClient.setQueryData<Task>(["task", { taskId: data.id }], () => data);
      queryClient.setQueryData<Task[]>(["tasks", { parentId }], (tasks) =>
        tasks?.find((task) => task.id === taskId)
          ? tasks?.map((task) => (task.id === taskId ? data : task)) ?? []
          : [...(tasks ?? []), data]
      );
    },
  });
};

export const useDeleteTask = (parentId: string, taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation(() => Api.deleteTask(taskId), {
    onSuccess: async () => {
      queryClient.removeQueries(["task", { taskId }]);
      queryClient.setQueryData<Task[]>(
        ["tasks", { parentId }],
        (tasks) => tasks?.filter((task) => task.id !== taskId) ?? []
      );
    },
  });
};
