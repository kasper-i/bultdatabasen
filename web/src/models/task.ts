import { ResourceBase } from "./resource";

export type TaskStatus = "open" | "assigned" | "closed" | "rejected";

export type Task = ResourceBase & {
  status: TaskStatus;
  description: string;
  priority: number;
  assignee?: string;
  comment?: string;
  createdAt: string;
  userId: string;
  closedAt?: string;
};
