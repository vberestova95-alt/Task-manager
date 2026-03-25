export type TaskCategory = string;

export type TaskStatus = "todo" | "done";

export type Task = {
  id: number;
  title: string;
  time?: string;
  category: TaskCategory;
  dueDate: string;
  status: TaskStatus;
};

export type AppScreen = "tasks" | "create" | "calendar" | "progress";
