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

export const useCreateTask = (routeId: string, parentId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (task: Pick<Task, "description">) => Api.createTask(parentId, task),
    {
      onSuccess: async (data) => {
        queryClient.setQueryData(["task", { taskId: data.id }], data);

        queryClient.setQueriesData<{
          data: Task[];
        }>(["tasks", { parentId: routeId }], (value) => ({
          ...value,
          data: [...(value?.data ?? []), data],
        }));
      },
    }
  );
};

export const useUpdateTask = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation((task: Task) => Api.updateTask(taskId, task), {
    onSuccess: async (data) => {
      queryClient.setQueryData<Task>(["task", { taskId }], data);

      queryClient.setQueriesData<{
        data: Task[];
      }>({ queryKey: ["tasks"], exact: false }, (value) =>
        value?.data?.find((task) => task.id === taskId)
          ? {
              ...value,
              data: value.data.map((cachedTask) =>
                cachedTask.id === taskId ? data : cachedTask
              ),
            }
          : value
      );
    },
  });
};

export const useDeleteTask = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation(() => Api.deleteTask(taskId), {
    onSuccess: async () => {
      queryClient.removeQueries(["task", { taskId }]);

      queryClient.setQueriesData<{
        data: Task[];
      }>({ queryKey: ["tasks"], exact: false }, (value) =>
        value !== undefined
          ? {
              ...value,
              data: value.data.filter((cachedTask) => cachedTask.id !== taskId),
            }
          : undefined
      );
    },
  });
};
