import "./CalendarScreen.css";

import type { CalendarMode } from "@/features/task-manager/model/types";
import { MONTH_FORMATTER, WEEKDAYS, buildCalendarRows, toIsoDate } from "@/shared/lib/date";
import { capitalize } from "@/shared/lib/string";
import { TopBar } from "@/shared/ui/TopBar/TopBar";
import { SmallArrowIcon } from "@/shared/ui/icons";

export type CalendarScreenProps = {
  mode: CalendarMode;
  selectedDate: string;
  visibleMonth: Date;
  onBack: () => void;
  onCancel: () => void;
  onApply: () => void;
  onSelectDate: (date: string) => void;
  onToday: () => void;
  onTomorrow: () => void;
  onClear: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarScreen({
  mode,
  selectedDate,
  visibleMonth,
  onBack,
  onCancel,
  onApply,
  onSelectDate,
  onToday,
  onTomorrow,
  onClear,
  onPrevMonth,
  onNextMonth
}: CalendarScreenProps) {
  const calendarRows = buildCalendarRows(visibleMonth);
  const monthLabel = capitalize(MONTH_FORMATTER.format(visibleMonth));

  return (
    <div className="screen screen--flat calendar-screen">
      <TopBar mode="back" onBack={onBack} />

      <div className="calendar-header">
        <button className="month-arrow month-arrow--left" type="button" aria-label="Назад" onClick={onPrevMonth}>
          <SmallArrowIcon direction="left" />
        </button>
        <h1>{monthLabel}</h1>
        <button className="month-arrow month-arrow--right" type="button" aria-label="Вперед" onClick={onNextMonth}>
          <SmallArrowIcon direction="right" />
        </button>
      </div>

      <div className="calendar-wrap">
        <div className="weekday-row">
          {WEEKDAYS.map((day) => (
            <span key={day} className="weekday-pill">
              {day}
            </span>
          ))}
        </div>

        {calendarRows.map((row, rowIndex) => (
          <div
            key={row.join("-")}
            className={`date-row ${
              rowIndex === 0 ? "date-row--end" : rowIndex === 4 ? "date-row--start" : "date-row--center"
            }`}
          >
            {row.map((day) => {
              const dateValue = toIsoDate(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)
              );
              const active = selectedDate === dateValue;

              return (
                <button
                  key={day}
                  className={`date-pill ${active ? "date-pill--active" : ""}`}
                  type="button"
                  onClick={() => onSelectDate(dateValue)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="shortcut-grid shortcut-grid--calendar">
        <button className="shortcut-card" type="button" onClick={onClear}>
          Очистить
        </button>
        <button className="shortcut-card" type="button" onClick={onToday}>
          Сегодня
        </button>
        <button className="shortcut-card" type="button" onClick={onTomorrow}>
          Завтра
        </button>
      </div>

      <div className="footer-buttons footer-buttons--calendar">
        <button className="ghost-pill" type="button" onClick={onCancel}>
          Отменить
        </button>
        <button className="filled-pill" type="button" onClick={onApply}>
          {mode === "filter" ? "Показать" : "Применить"}
        </button>
      </div>
    </div>
  );
}
