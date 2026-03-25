import type { Task, TaskCategory } from "./types";

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
