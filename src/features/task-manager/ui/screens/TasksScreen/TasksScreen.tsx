import "./TasksScreen.css";

import type { TabItem, Task, TaskCategory, TelegramUser } from "@/features/task-manager/model/types";
import { ConfettiBurst } from "@/features/task-manager/ui/components/ConfettiBurst/ConfettiBurst";
import { BottomNav } from "@/features/task-manager/ui/components/BottomNav/BottomNav";
import { CategoryTabs } from "@/features/task-manager/ui/components/CategoryTabs/CategoryTabs";
import { formatCalendarTitle } from "@/shared/lib/date";
import { HeaderProfile } from "@/shared/ui/HeaderProfile/HeaderProfile";
import { TopBar } from "@/shared/ui/TopBar/TopBar";
import { CalendarBadgeIcon, CheckIcon } from "@/shared/ui/icons";

export type TasksScreenProps = {
  activeCategory: TaskCategory;
  celebrationBurst: number;
  filterDate: string;
  isCelebratingDay: boolean;
  tabs: TabItem[];
  onCategoryChange: (category: TaskCategory) => void;
  tasks: Task[];
  onToggleTask: (taskId: number) => void;
  onOpenCreate: () => void;
  onOpenCalendar: () => void;
  onOpenTabsSettings: () => void;
  onOpenProgress: () => void;
  telegramUser: TelegramUser | null;
};

export function TasksScreen({
  activeCategory,
  celebrationBurst,
  filterDate,
  isCelebratingDay,
  tabs,
  onCategoryChange,
  tasks,
  onToggleTask,
  onOpenCreate,
  onOpenCalendar,
  onOpenTabsSettings,
  onOpenProgress,
  telegramUser
}: TasksScreenProps) {
  const titleLabel = filterDate ? formatCalendarTitle(filterDate) : "Все задачи";

  return (
    <div className="screen screen--tasks tasks-screen">
      <div className="hero-glow" aria-hidden="true" />
      {isCelebratingDay ? <ConfettiBurst key={celebrationBurst} /> : null}
      <TopBar mode="close" onBack={undefined} />
      <HeaderProfile telegramUser={telegramUser} />

      <button className="title-row title-row--center" type="button" onClick={onOpenCalendar}>
        <span>{titleLabel}</span>
        <CalendarBadgeIcon />
      </button>

      <CategoryTabs
        activeCategory={activeCategory}
        tabs={tabs}
        onCategoryChange={onCategoryChange}
        onOpenTabsSettings={onOpenTabsSettings}
      />

      <div className="tasks-scroll">
        <div className="task-column">
          {tasks.map((task) => (
            <button
              key={task.id}
              className={`task-item ${task.status === "done" ? "task-item--done" : ""}`}
              type="button"
              onClick={() => onToggleTask(task.id)}
            >
              <span className={`task-checkbox ${task.status === "done" ? "task-checkbox--checked" : ""}`}>
                {task.status === "done" ? <CheckIcon /> : null}
              </span>
              <span className="task-title">{task.title}</span>
              <span className="task-label">{task.time ?? ""}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav
        activeTab="tasks"
        onOpenTasks={() => undefined}
        onOpenCreate={onOpenCreate}
        onOpenProgress={onOpenProgress}
      />
    </div>
  );
}
