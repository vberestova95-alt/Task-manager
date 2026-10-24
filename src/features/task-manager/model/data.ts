import { TODAY_ISO } from "@/shared/lib/date";

import type { DraftTask, NotificationSettings, Task, TaskCategory, TabItem } from "./types";

export const categoryLabels: Record<TaskCategory, string> = {
  home: "Домашние дела",
  shopping: "Покупки",
  work: "Работа"
};

export const initialTasks: Task[] = [
  {
    id: 1,
    title: "Погладить кота",
    time: "9:30-10:00",
    category: "home",
    dueDate: "2026-01-21",
    status: "todo"
  },
  {
    id: 2,
    title: "Помыть посуду",
    category: "home",
    dueDate: "2026-01-21",
    status: "todo"
  },
  {
    id: 3,
    title: "Купить продукты",
    category: "shopping",
    dueDate: "2026-01-21",
    status: "todo"
  },
  {
    id: 4,
    title: "Включить пылесос",
    category: "home",
    dueDate: "2026-01-21",
    status: "todo"
  },
  {
    id: 5,
    title: "Развесить одежду",
    category: "home",
    dueDate: "2026-01-21",
    status: "done"
  }
];

export const initialTabs: TabItem[] = [
  { id: "home", label: "Домашние дела" },
  { id: "shopping", label: "Покупки" },
  { id: "work", label: "Работа" }
];

export const defaultDraft: DraftTask = {
  title: "",
  description: "",
  category: "home",
  dueDate: TODAY_ISO
};

export const initialNotificationSettings: NotificationSettings = {
  date: TODAY_ISO,
  time: "",
  repeat: "Никогда"
};
