import { Task } from "@/models/task";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Api } from "../Api";

export const useTasks = (parentId: string) =>
  useQuery(["tasks", { parentId }], () => Api.getTasks(parentId));

export const useTask = (taskId: string) =>
  useQuery(["task", { taskId }], () => Api.getTask(taskId));

export const useCreateTask = (parentId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    (task: Pick<Task, "description">) => Api.createTask(parentId, task),
    {
      onSuccess: async (data) => {
        queryClient.refetchQueries(["task", { taskId: data.id }]);
        queryClient.setQueryData<Task[]>(["tasks", { parentId }], (tasks) => [
          ...(tasks ?? []),
          data,
        ]);
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
