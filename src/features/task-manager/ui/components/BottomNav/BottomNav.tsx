import "./BottomNav.css";

import { GridIcon, PlusIcon, ProgressGlyphIcon } from "@/shared/ui/icons";

type BottomNavProps = {
  activeTab: "tasks" | "progress";
  onOpenTasks: () => void;
  onOpenCreate: () => void;
  onOpenProgress: () => void;
};

export function BottomNav({ activeTab, onOpenTasks, onOpenCreate, onOpenProgress }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-tab ${activeTab === "tasks" ? "nav-tab--active" : ""}`}
        type="button"
        onClick={activeTab === "tasks" ? undefined : onOpenTasks}
      >
        <GridIcon />
        <span>Задачи</span>
      </button>
      <button className="fab" type="button" onClick={onOpenCreate} aria-label="Добавить">
        <PlusIcon />
      </button>
      <button
        className={`nav-tab ${activeTab === "progress" ? "nav-tab--active" : ""}`}
        type="button"
        onClick={activeTab === "progress" ? undefined : onOpenProgress}
      >
        <ProgressGlyphIcon />
        <span>Прогресс</span>
      </button>
    </nav>
  );
}
