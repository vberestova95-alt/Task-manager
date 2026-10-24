import "./CreateScreen.css";

import type { DraftTask, NotificationSettings, TabItem, TaskCategory } from "@/features/task-manager/model/types";
import { CategoryTabs } from "@/features/task-manager/ui/components/CategoryTabs/CategoryTabs";
import { NotificationRow } from "@/features/task-manager/ui/components/NotificationRow/NotificationRow";
import { formatCalendarTitle, formatDisplayDate } from "@/shared/lib/date";
import { TopBar } from "@/shared/ui/TopBar/TopBar";
import { CalendarBadgeIcon } from "@/shared/ui/icons";

export type CreateScreenProps = {
  activeCategory: TaskCategory;
  tabs: TabItem[];
  draft: DraftTask;
  notificationSettings: NotificationSettings;
  onBack: () => void;
  onCategoryChange: (category: TaskCategory) => void;
  onCalendar: () => void;
  onOpenTabsSettings: () => void;
  onDraftChange: (field: "title" | "description", value: string) => void;
  onNotificationDateClick: () => void;
  onNotificationTimeChange: (value: string) => void;
  onRepeatChange: () => void;
  onSubmit: () => void;
};

export function CreateScreen({
  activeCategory,
  tabs,
  draft,
  notificationSettings,
  onBack,
  onCategoryChange,
  onCalendar,
  onOpenTabsSettings,
  onDraftChange,
  onNotificationDateClick,
  onNotificationTimeChange,
  onRepeatChange,
  onSubmit
}: CreateScreenProps) {
  const titleLabel = draft.dueDate ? formatCalendarTitle(draft.dueDate) : "Выберите дату";

  return (
    <div className="screen screen--flat create-screen">
      <TopBar mode="back" onBack={onBack} />

      <button className="title-row title-row--left title-row--create" type="button" onClick={onCalendar}>
        <span>{titleLabel}</span>
        <CalendarBadgeIcon />
      </button>

      <CategoryTabs
        activeCategory={activeCategory}
        tabs={tabs}
        onCategoryChange={onCategoryChange}
        onOpenTabsSettings={onOpenTabsSettings}
      />

      <div className="create-copy">
        <input
          className="title-input"
          value={draft.title}
          onChange={(event) => onDraftChange("title", event.target.value)}
          placeholder="Название задачи"
        />
        <textarea
          className="description-input"
          value={draft.description}
          onChange={(event) => onDraftChange("description", event.target.value)}
          placeholder="Описание"
        />
      </div>

      <div className="notification-card notification-card--create">
        <div className="notification-card__title">Настройка уведомлений</div>
        <NotificationRow
          label="Дата"
          value={notificationSettings.date ? formatDisplayDate(notificationSettings.date) : "Не выбрана"}
          onClick={onNotificationDateClick}
        />
        <NotificationRow
          label="Время"
          value={notificationSettings.time || "Нет"}
          action={
            <input
              className="time-input"
              type="time"
              value={notificationSettings.time}
              onChange={(event) => onNotificationTimeChange(event.target.value)}
            />
          }
        />
        <NotificationRow label="Повтор" value={notificationSettings.repeat} onClick={onRepeatChange} />
      </div>

      <div className="footer-buttons footer-buttons--create">
        <button className="ghost-pill" type="button" onClick={onBack}>
          Назад
        </button>
        <button className="filled-pill" type="button" onClick={onSubmit}>
          Создать
        </button>
      </div>
    </div>
  );
}
