import "./CategoryTabs.css";

import { categoryLabels } from "@/features/task-manager/model/data";
import type { TabItem, TaskCategory } from "@/features/task-manager/model/types";
import { SlidersIcon } from "@/shared/ui/icons";

export type CategoryTabsProps = {
  activeCategory: TaskCategory;
  tabs: TabItem[];
  onCategoryChange: (category: TaskCategory) => void;
  onOpenTabsSettings: () => void;
};

export function CategoryTabs({ activeCategory, tabs, onCategoryChange, onOpenTabsSettings }: CategoryTabsProps) {
  return (
    <div className="category-row">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`category-pill ${activeCategory === tab.id ? "category-pill--active" : ""}`}
          type="button"
          onClick={() => onCategoryChange(tab.id)}
        >
          {tab.label ?? categoryLabels[tab.id]}
        </button>
      ))}
      <button className="category-settings-button" type="button" onClick={onOpenTabsSettings} aria-label="Настроить табы">
        <SlidersIcon />
      </button>
    </div>
  );
}
