import "./TabsSettingsModal.css";

import type { TabItem } from "@/features/task-manager/model/types";
import { CloseIcon } from "@/shared/ui/icons";

export type TabsSettingsModalProps = {
  tabs: TabItem[];
  draggedTabId: string | null;
  newTabLabel: string;
  onClose: () => void;
  onNewTabLabelChange: (value: string) => void;
  onAddTab: () => void;
  onDeleteTab: (tabId: string) => void;
  onDragStart: (tabId: string) => void;
  onDragEnd: () => void;
  onMoveTab: (targetTabId: string) => void;
};

export function TabsSettingsModal({
  tabs,
  draggedTabId,
  newTabLabel,
  onClose,
  onNewTabLabelChange,
  onAddTab,
  onDeleteTab,
  onDragStart,
  onDragEnd,
  onMoveTab
}: TabsSettingsModalProps) {
  return (
    <div className="tabs-modal-backdrop" role="dialog" aria-modal="true">
      <div className="tabs-modal">
        <div className="tabs-modal__header">
          <h2>Настройка категорий</h2>
          <button type="button" onClick={onClose} aria-label="Закрыть">
            <CloseIcon />
          </button>
        </div>

        <div className="tabs-modal__list">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tabs-modal__row ${draggedTabId === tab.id ? "tabs-modal__row--dragging" : ""}`}
              draggable
              onDragStart={() => onDragStart(tab.id)}
              onDragEnd={onDragEnd}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onMoveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <button type="button" onClick={() => onDeleteTab(tab.id)} disabled={tabs.length === 1}>
                Удалить
              </button>
            </div>
          ))}
        </div>

        <div className="tabs-modal__add">
          <input
            type="text"
            value={newTabLabel}
            onChange={(event) => onNewTabLabelChange(event.target.value)}
            placeholder="Новая категория"
          />
          <button type="button" onClick={onAddTab}>
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}
