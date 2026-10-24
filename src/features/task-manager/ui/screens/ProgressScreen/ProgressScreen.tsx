import "@/features/task-manager/ui/screens/CalendarScreen/CalendarScreen.css";
import "./ProgressScreen.css";

import type { TelegramUser } from "@/features/task-manager/model/types";
import { BottomNav } from "@/features/task-manager/ui/components/BottomNav/BottomNav";
import { MONTH_FORMATTER, WEEKDAYS, buildCalendarRows, toIsoDate } from "@/shared/lib/date";
import { capitalize } from "@/shared/lib/string";
import { HeaderProfile } from "@/shared/ui/HeaderProfile/HeaderProfile";
import { TopBar } from "@/shared/ui/TopBar/TopBar";
import { CrystalBadgeIcon, CrystalClusterIcon, SmallArrowIcon } from "@/shared/ui/icons";

export type ProgressScreenProps = {
  currentStreak: number;
  personalBest: number;
  visibleMonth: Date;
  completedDates: string[];
  onOpenTasks: () => void;
  onOpenCreate: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  telegramUser: TelegramUser | null;
};

export function ProgressScreen({
  currentStreak,
  personalBest,
  visibleMonth,
  completedDates,
  onOpenTasks,
  onOpenCreate,
  onPrevMonth,
  onNextMonth,
  telegramUser
}: ProgressScreenProps) {
  const calendarRows = buildCalendarRows(visibleMonth);
  const monthLabel = capitalize(MONTH_FORMATTER.format(visibleMonth));
  const completedSet = new Set(completedDates);

  return (
    <div className="screen screen--tasks progress-screen">
      <div className="hero-glow" aria-hidden="true" />
      <TopBar mode="close" onBack={undefined} />
      <HeaderProfile telegramUser={telegramUser} />

      <div className="progress-scroll">
        <div className="progress-cards">
          <div className="progress-card">
            <div className="progress-card__badge progress-card__badge--left">
              <CrystalBadgeIcon />
            </div>
            <div className="progress-card__value">{currentStreak} дня</div>
            <div className="progress-card__label">Боевой дух</div>
          </div>
          <div className="progress-card">
            <div className="progress-card__badge progress-card__badge--right">
              <CrystalClusterIcon />
            </div>
            <div className="progress-card__value">{personalBest} дней</div>
            <div className="progress-card__label">Личный рекорд</div>
          </div>
        </div>

        <div className="progress-calendar">
          <div className="calendar-header calendar-header--progress">
            <button className="month-arrow month-arrow--left" type="button" aria-label="Назад" onClick={onPrevMonth}>
              <SmallArrowIcon direction="left" />
            </button>
            <h1>{monthLabel}</h1>
            <button className="month-arrow month-arrow--right" type="button" aria-label="Вперед" onClick={onNextMonth}>
              <SmallArrowIcon direction="right" />
            </button>
          </div>

          <div className="calendar-wrap calendar-wrap--progress">
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
                  const active = completedSet.has(dateValue);

                  return (
                    <div
                      key={day}
                      className={`date-pill ${active ? "date-pill--active" : ""}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav
        activeTab="progress"
        onOpenTasks={onOpenTasks}
        onOpenCreate={onOpenCreate}
        onOpenProgress={() => undefined}
      />
    </div>
  );
}
