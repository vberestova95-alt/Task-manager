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

export type CalendarMode = "filter" | "draft";

export type CalendarTarget = "taskDate" | "notificationDate";

export type DraftTask = {
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
};

export type TabItem = {
  id: TaskCategory;
  label: string;
};

export type NotificationSettings = {
  date: string;
  time: string;
  repeat: string;
};

export type TelegramUser = {
  name: string;
  username: string;
  avatar?: string;
};
