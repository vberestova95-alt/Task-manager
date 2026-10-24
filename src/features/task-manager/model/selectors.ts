import { NOW, addDays, toIsoDate } from "@/shared/lib/date";

import type { Task } from "./types";

export function getCompletedDates(tasks: Task[]) {
  const byDate = new Map<string, Task[]>();

  tasks.forEach((task) => {
    const group = byDate.get(task.dueDate) ?? [];
    group.push(task);
    byDate.set(task.dueDate, group);
  });

  return [...byDate.entries()]
    .filter(([, dateTasks]) => dateTasks.length > 0 && dateTasks.every((task) => task.status === "done"))
    .map(([date]) => date)
    .sort();
}

export function getCurrentStreak(completedDates: string[]) {
  const completedSet = new Set(completedDates);
  let streak = 0;
  let cursor = new Date(NOW);

  while (completedSet.has(toIsoDate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function getPersonalBest(completedDates: string[]) {
  if (completedDates.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let index = 1; index < completedDates.length; index += 1) {
    const prev = new Date(completedDates[index - 1]);
    const currentDate = new Date(completedDates[index]);
    const diff = Math.round((currentDate.getTime() - prev.getTime()) / 86400000);

    if (diff === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}
