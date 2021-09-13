export type TaskStatus = "open" | "assigned" | "closed" | "rejected";

export interface Task {
  id: string;
  status: TaskStatus;
  description: string;
  assignee?: string;
  comment?: string;
  parentId: string;
}
