import { ResourceBase } from "./resource";

export type TaskStatus = "open" | "assigned" | "closed" | "rejected";

export type Task = ResourceBase & {
  status: TaskStatus;
  description: string;
  assignee?: string;
  comment?: string;
  parentId: string;
};
