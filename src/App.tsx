import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { categoryLabels, initialTasks } from "./data";
import { setupTelegramApp } from "./lib/telegram";
import type { AppScreen, Task, TaskCategory } from "./types";

const calendarEditIconAsset =
  "https://www.figma.com/api/mcp/asset/848774da-a48f-4637-bb8e-e64b51d2b3d2";
const progressCrystalSpiritAsset =
  "https://www.figma.com/api/mcp/asset/f937b298-56ca-4197-8655-9f1b7ddde43b";
const progressCrystalRecordAsset =
  "https://www.figma.com/api/mcp/asset/000b5da2-02aa-4d65-bc69-41b9ad7be8f2";
const progressNavIconAsset =
  "https://www.figma.com/api/mcp/asset/840c33e2-749b-4bd6-af45-6591547ef70d";

const NOW = new Date();
const TODAY_ISO = toIsoDate(NOW);
type CalendarMode = "filter" | "draft";
type CalendarTarget = "taskDate" | "notificationDate";

type DraftTask = {
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
};

const defaultDraft: DraftTask = {
  title: "",
  description: "",
  category: "home",
  dueDate: TODAY_ISO
};

type TabItem = {
  id: TaskCategory;
  label: string;
};

const initialTabs: TabItem[] = [
  { id: "home", label: "Домашние дела" },
  { id: "shopping", label: "Покупки" },
  { id: "work", label: "Работа" }
];
const weekdays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long" });
const initialNotificationSettings = {
  date: TODAY_ISO,
  time: "",
  repeat: "Никогда"
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("tasks");
  const [activeCategory, setActiveCategory] = useState<TaskCategory>("home");
  const [filterDate, setFilterDate] = useState(TODAY_ISO);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(NOW));
  const [progressMonth, setProgressMonth] = useState(() => startOfMonth(NOW));
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("filter");
  const [calendarTarget, setCalendarTarget] = useState<CalendarTarget>("taskDate");
  const [calendarSelection, setCalendarSelection] = useState(TODAY_ISO);
  const [tabs, setTabs] = useState<TabItem[]>(initialTabs);
  const [tabsSettingsOpen, setTabsSettingsOpen] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState("");
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(() =>
    initialTasks.map((task) => ({ ...task, dueDate: TODAY_ISO }))
  );
  const [draft, setDraft] = useState<DraftTask>(defaultDraft);
  const [notificationSettings, setNotificationSettings] = useState(initialNotificationSettings);
  const [isCelebratingDay, setIsCelebratingDay] = useState(false);
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const [telegramUser, setTelegramUser] = useState<{
    name: string;
    username: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const webApp = setupTelegramApp();
    const user = webApp?.initDataUnsafe?.user;

    if (!user) {
      return;
    }

    setTelegramUser({
      name: user.first_name ?? "V",
      username: user.username ? `@${user.username}` : "@vberestova12",
      avatar: user.photo_url
    });
  }, []);

  useEffect(() => {
    if (!isCelebratingDay) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsCelebratingDay(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [isCelebratingDay, celebrationBurst]);

  const filteredTasks = tasks.filter(
    (task) =>
      task.category === activeCategory &&
      (filterDate ? task.dueDate === filterDate : true)
  );
  const completedDates = getCompletedDates(tasks);
  const currentStreak = getCurrentStreak(completedDates);
  const personalBest = getPersonalBest(completedDates);

  function toggleTask(taskId: number) {
    const nextTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: task.status === "done" ? ("todo" as const) : ("done" as const)
          }
        : task
    );

    setTasks(nextTasks);

    const toggledTask = nextTasks.find((task) => task.id === taskId);
    if (!toggledTask || screen !== "tasks" || !filterDate) {
      return;
    }

    if (toggledTask.category !== activeCategory || toggledTask.dueDate !== filterDate) {
      return;
    }

    const dayTasks = nextTasks.filter(
      (task) => task.category === activeCategory && task.dueDate === filterDate
    );

    const shouldCelebrate =
      toggledTask.status === "done" &&
      dayTasks.length > 0 &&
      dayTasks.every((task) => task.status === "done");

    if (shouldCelebrate) {
      setCelebrationBurst((currentBurst) => currentBurst + 1);
      setIsCelebratingDay(true);
    }
  }

  function openCreateScreen() {
    const sourceDate = filterDate || TODAY_ISO;

    setDraft((currentDraft) => ({
      ...currentDraft,
      category: activeCategory,
      dueDate: sourceDate
    }));
    setNotificationSettings((currentSettings) => ({
      ...currentSettings,
      date: sourceDate
    }));
    setScreen("create");
  }

  function openFilterCalendar() {
    const baseDate = filterDate ? new Date(filterDate) : NOW;
    setCalendarMode("filter");
    setCalendarTarget("taskDate");
    setCalendarSelection(filterDate);
    setVisibleMonth(startOfMonth(baseDate));
    setScreen("calendar");
  }

  function openDraftCalendar() {
    const baseDate = draft.dueDate ? new Date(draft.dueDate) : NOW;
    setCalendarMode("draft");
    setCalendarTarget("taskDate");
    setCalendarSelection(draft.dueDate);
    setVisibleMonth(startOfMonth(baseDate));
    setScreen("calendar");
  }

  function openNotificationCalendar() {
    const baseDate = notificationSettings.date ? new Date(notificationSettings.date) : NOW;
    setCalendarMode("draft");
    setCalendarTarget("notificationDate");
    setCalendarSelection(notificationSettings.date);
    setVisibleMonth(startOfMonth(baseDate));
    setScreen("calendar");
  }

  function submitTask() {
    if (!draft.title.trim()) {
      return;
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: Date.now(),
        title: draft.title.trim(),
        category: draft.category,
        dueDate: draft.dueDate,
        status: "todo"
      }
    ]);

    setActiveCategory(draft.category);
    setFilterDate(draft.dueDate);
    setDraft(defaultDraft);
    setNotificationSettings(initialNotificationSettings);
    setScreen("tasks");
  }

  return (
    <div className="shell">
      <div className={`phone-screen ${screen === "create" || screen === "calendar" ? "phone-screen--flat" : ""}`}>
        {screen === "tasks" ? (
          <TasksScreen
            activeCategory={activeCategory}
            celebrationBurst={celebrationBurst}
            filterDate={filterDate}
            isCelebratingDay={isCelebratingDay}
            tabs={tabs}
            onCategoryChange={setActiveCategory}
            tasks={filteredTasks}
            onToggleTask={toggleTask}
            onOpenCreate={openCreateScreen}
            onOpenCalendar={openFilterCalendar}
            onOpenTabsSettings={() => setTabsSettingsOpen(true)}
            onOpenProgress={() => setScreen("progress")}
            telegramUser={telegramUser}
          />
        ) : null}

        {screen === "create" ? (
          <CreateScreen
            activeCategory={draft.category}
            tabs={tabs}
            draft={draft}
            notificationSettings={notificationSettings}
            onBack={() => setScreen("tasks")}
            onCategoryChange={(category) =>
              setDraft((currentDraft) => ({ ...currentDraft, category }))
            }
            onCalendar={openDraftCalendar}
            onOpenTabsSettings={() => setTabsSettingsOpen(true)}
            onDraftChange={(field, value) =>
              setDraft((currentDraft) => ({ ...currentDraft, [field]: value }))
            }
            onNotificationTimeChange={(value) =>
              setNotificationSettings((currentSettings) => ({
                ...currentSettings,
                time: value
              }))
            }
            onNotificationDateClick={openNotificationCalendar}
            onRepeatChange={() =>
              setNotificationSettings((currentSettings) => ({
                ...currentSettings,
                repeat: nextRepeat(currentSettings.repeat)
              }))
            }
            onSubmit={submitTask}
          />
        ) : null}

        {screen === "calendar" ? (
          <CalendarScreen
            mode={calendarMode}
            selectedDate={calendarSelection}
            visibleMonth={visibleMonth}
            onBack={() => setScreen(calendarMode === "filter" ? "tasks" : "create")}
            onCancel={() => setScreen(calendarMode === "filter" ? "tasks" : "create")}
            onApply={() => {
              if (calendarMode === "filter") {
                setFilterDate(calendarSelection);
                setScreen("tasks");
                return;
              }

              if (calendarTarget === "taskDate") {
                setDraft((currentDraft) => ({ ...currentDraft, dueDate: calendarSelection }));
              } else {
                setNotificationSettings((currentSettings) => ({
                  ...currentSettings,
                  date: calendarSelection
                }));
              }
              setScreen("create");
            }}
            onSelectDate={setCalendarSelection}
            onToday={() => {
              setVisibleMonth(startOfMonth(NOW));
              setCalendarSelection(TODAY_ISO);
            }}
            onTomorrow={() => {
              const tomorrow = addDays(NOW, 1);
              const tomorrowIso = toIsoDate(tomorrow);
              setVisibleMonth(startOfMonth(tomorrow));
              setCalendarSelection(tomorrowIso);
            }}
            onClear={() => setCalendarSelection("")}
            onPrevMonth={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))}
            onNextMonth={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))}
          />
        ) : null}

        {screen === "progress" ? (
          <ProgressScreen
            currentStreak={currentStreak}
            personalBest={personalBest}
            visibleMonth={progressMonth}
            completedDates={completedDates}
            onOpenTasks={() => setScreen("tasks")}
            onOpenCreate={openCreateScreen}
            onPrevMonth={() => setProgressMonth((currentMonth) => addMonths(currentMonth, -1))}
            onNextMonth={() => setProgressMonth((currentMonth) => addMonths(currentMonth, 1))}
            telegramUser={telegramUser}
          />
        ) : null}

        {tabsSettingsOpen ? (
          <TabsSettingsModal
            tabs={tabs}
            draggedTabId={draggedTabId}
            newTabLabel={newTabLabel}
            onClose={() => {
              setTabsSettingsOpen(false);
              setNewTabLabel("");
              setDraggedTabId(null);
            }}
            onNewTabLabelChange={setNewTabLabel}
            onAddTab={() => {
              const value = newTabLabel.trim();

              if (!value) {
                return;
              }

              const id = slugify(value);
              if (tabs.some((tab) => tab.id === id || tab.label.toLowerCase() === value.toLowerCase())) {
                return;
              }

              setTabs((currentTabs) => [...currentTabs, { id, label: value }]);
              setNewTabLabel("");
            }}
            onDeleteTab={(tabId) => {
              setTabs((currentTabs) => {
                const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);
                if (nextTabs.length === 0) {
                  return currentTabs;
                }
                if (activeCategory === tabId) {
                  setActiveCategory(nextTabs[0].id);
                }
                if (draft.category === tabId) {
                  setDraft((currentDraft) => ({ ...currentDraft, category: nextTabs[0].id }));
                }
                return nextTabs;
              });
            }}
            onDragStart={setDraggedTabId}
            onDragEnd={() => setDraggedTabId(null)}
            onMoveTab={(targetTabId) => {
              setTabs((currentTabs) => {
                if (!draggedTabId || draggedTabId === targetTabId) {
                  return currentTabs;
                }

                const fromIndex = currentTabs.findIndex((tab) => tab.id === draggedTabId);
                const toIndex = currentTabs.findIndex((tab) => tab.id === targetTabId);

                if (fromIndex === -1 || toIndex === -1) {
                  return currentTabs;
                }

                const nextTabs = [...currentTabs];
                const [movedTab] = nextTabs.splice(fromIndex, 1);
                nextTabs.splice(toIndex, 0, movedTab);
                return nextTabs;
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

type TasksScreenProps = {
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
  telegramUser: { name: string; username: string; avatar?: string } | null;
};

function TasksScreen({
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
    <div className="screen screen--tasks">
      <div className="hero-glow" aria-hidden="true" />
      {isCelebratingDay ? <ConfettiBurst key={celebrationBurst} /> : null}
      <TopBar mode="close" onBack={undefined} />
      <HeaderProfile telegramUser={telegramUser} />

      <button className="title-row title-row--center" type="button" onClick={onOpenCalendar}>
        <span>{titleLabel}</span>
        <CalendarBadgeIcon />
      </button>

      <CategoryRow
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

      <nav className="bottom-nav">
        <button className="nav-tab nav-tab--active" type="button">
          <GridIcon />
          <span>Задачи</span>
        </button>
        <button className="fab" type="button" onClick={onOpenCreate} aria-label="Добавить">
          <PlusIcon />
        </button>
        <button className="nav-tab" type="button" onClick={onOpenProgress}>
          <ProgressGlyphIcon />
          <span>Прогресс</span>
        </button>
      </nav>
    </div>
  );
}

function ConfettiBurst() {
  const confettiPieces = [
    { left: "7%", delay: "0ms", duration: "1350ms", rotate: "-18deg", color: "#f6cb79" },
    { left: "14%", delay: "80ms", duration: "1480ms", rotate: "16deg", color: "#db9a71" },
    { left: "22%", delay: "40ms", duration: "1320ms", rotate: "-12deg", color: "#8d74ff" },
    { left: "31%", delay: "140ms", duration: "1520ms", rotate: "20deg", color: "#8dc8ff" },
    { left: "39%", delay: "10ms", duration: "1420ms", rotate: "-22deg", color: "#f5e3a1" },
    { left: "48%", delay: "100ms", duration: "1500ms", rotate: "12deg", color: "#cfa6ff" },
    { left: "57%", delay: "20ms", duration: "1370ms", rotate: "-10deg", color: "#db9a71" },
    { left: "66%", delay: "110ms", duration: "1460ms", rotate: "18deg", color: "#90b8ff" },
    { left: "74%", delay: "60ms", duration: "1390ms", rotate: "-15deg", color: "#f6cb79" },
    { left: "82%", delay: "150ms", duration: "1530ms", rotate: "24deg", color: "#8d74ff" },
    { left: "90%", delay: "30ms", duration: "1410ms", rotate: "-20deg", color: "#f7b6a3" }
  ];

  return (
    <div className="confetti-burst" aria-hidden="true">
      {confettiPieces.map((piece, index) => (
        <span
          key={`${piece.left}-${index}`}
          className="confetti-piece"
          style={
            {
              "--confetti-left": piece.left,
              "--confetti-delay": piece.delay,
              "--confetti-duration": piece.duration,
              "--confetti-rotate": piece.rotate,
              "--confetti-color": piece.color
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

type ProgressScreenProps = {
  currentStreak: number;
  personalBest: number;
  visibleMonth: Date;
  completedDates: string[];
  onOpenTasks: () => void;
  onOpenCreate: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  telegramUser: { name: string; username: string; avatar?: string } | null;
};

function ProgressScreen({
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
  const monthLabel = capitalize(monthFormatter.format(visibleMonth));
  const completedSet = new Set(completedDates);

  return (
    <div className="screen screen--tasks">
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
              {weekdays.map((day) => (
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

      <nav className="bottom-nav">
        <button className="nav-tab" type="button" onClick={onOpenTasks}>
          <GridIcon />
          <span>Задачи</span>
        </button>
        <button className="fab" type="button" onClick={onOpenCreate} aria-label="Добавить">
          <PlusIcon />
        </button>
        <button className="nav-tab nav-tab--active" type="button">
          <ProgressGlyphIcon />
          <span>Прогресс</span>
        </button>
      </nav>
    </div>
  );
}

type CreateScreenProps = {
  activeCategory: TaskCategory;
  tabs: TabItem[];
  draft: DraftTask;
  notificationSettings: {
    date: string;
    time: string;
    repeat: string;
  };
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

function CreateScreen({
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
    <div className="screen screen--flat">
      <TopBar mode="back" onBack={onBack} />

      <button className="title-row title-row--left title-row--create" type="button" onClick={onCalendar}>
        <span>{titleLabel}</span>
        <CalendarBadgeIcon />
      </button>

      <CategoryRow
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

type CalendarScreenProps = {
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

function CalendarScreen({
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
  const monthLabel = capitalize(monthFormatter.format(visibleMonth));

  return (
    <div className="screen screen--flat">
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
          {weekdays.map((day) => (
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

type NotificationRowProps = {
  label: string;
  value: string;
  onClick?: () => void;
  disabled?: boolean;
  action?: ReactNode;
};

function NotificationRow({ label, value, onClick, disabled, action }: NotificationRowProps) {
  if (action) {
    return (
      <div className="notification-row">
        <span className="notification-row__label">{label}</span>
        <span className="notification-row__value notification-row__value--input">{action}</span>
        <span className="notification-row__chevron">›</span>
      </div>
    );
  }

  return (
    <button
      className={`notification-row ${disabled ? "notification-row--disabled" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
    >
      <span className="notification-row__label">{label}</span>
      <span className="notification-row__value">{value}</span>
      <span className="notification-row__chevron">›</span>
    </button>
  );
}

type CategoryRowProps = {
  activeCategory: TaskCategory;
  tabs: TabItem[];
  onCategoryChange: (category: TaskCategory) => void;
  onOpenTabsSettings: () => void;
};

function CategoryRow({ activeCategory, tabs, onCategoryChange, onOpenTabsSettings }: CategoryRowProps) {
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

type TabsSettingsModalProps = {
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

function TabsSettingsModal({
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

type TopBarProps = {
  mode: "close" | "back";
  onBack?: () => void;
};

function TopBar({ mode, onBack }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="nav-bar">
        <button className="nav-leading" type="button" onClick={onBack} aria-label={mode === "close" ? "Закрыть" : "Назад"}>
          {mode === "close" ? <CloseIcon /> : <ArrowLeftIcon />}
        </button>
        <div className="nav-title">Tasks</div>
        <button className="nav-arrow" type="button" aria-label="Свернуть">
          <ChevronDownIcon />
        </button>
        <button className="nav-menu" type="button" aria-label="Меню">
          <MoreVerticalIcon />
        </button>
      </div>
    </header>
  );
}

function HeaderProfile({
  telegramUser
}: {
  telegramUser: { name: string; username: string; avatar?: string } | null;
}) {
  return (
    <div className="profile-header">
      <div className="profile-left">
        <div className="profile-avatar">
          {telegramUser?.avatar ? <img src={telegramUser.avatar} alt={telegramUser.name} /> : <span />}
        </div>
        <div className="profile-name">{telegramUser?.username ?? "@vberestova12"}</div>
        <ChevronRightIcon />
      </div>
      <div className="profile-chip">standart</div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6L9 12L15 18" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9L12 15L18 9" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6L15 12L9 18" />
    </svg>
  );
}

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5V5.01M12 12V12.01M12 19V19.01" />
    </svg>
  );
}

function CalendarBadgeIcon() {
  return (
    <img src={calendarEditIconAsset} alt="" aria-hidden="true" />
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6H14M18 6H20M10 12H20M4 12H6M4 18H12M16 18H20" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="14" cy="18" r="2" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" fill="currentColor" />
      <rect x="13" y="4" width="7" height="7" fill="currentColor" />
      <rect x="4" y="13" width="7" height="7" fill="currentColor" />
      <rect x="13" y="13" width="7" height="7" fill="currentColor" />
    </svg>
  );
}

function ProgressGlyphIcon() {
  return (
    <span className="progress-nav-icon" aria-hidden="true">
      <img src={progressNavIconAsset} alt="" />
    </span>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5V19M5 12H19" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 12.5L10.5 16L17 9.5" />
    </svg>
  );
}

function SmallArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={direction === "right" ? "small-arrow small-arrow--right" : "small-arrow"}
    >
      <path d="M10.5 3L5.5 8L10.5 13" />
    </svg>
  );
}

function CrystalBadgeIcon() {
  return (
    <img src={progressCrystalSpiritAsset} alt="" aria-hidden="true" />
  );
}

function CrystalClusterIcon() {
  return (
    <img src={progressCrystalRecordAsset} alt="" aria-hidden="true" />
  );
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function buildCalendarRows(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: number[][] = [];
  let currentRow: number[] = [];

  for (let empty = 0; empty < startOffset; empty += 1) {
    currentRow.push(-1);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    currentRow.push(day);

    if (currentRow.length === 7) {
      days.push(currentRow.filter((item) => item !== -1));
      currentRow = [];
    }
  }

  if (currentRow.length > 0) {
    days.push(currentRow.filter((item) => item !== -1));
  }

  return days;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function nextRepeat(currentRepeat: string) {
  const repeats = ["Никогда", "Каждый день", "Каждую неделю"];
  const index = repeats.indexOf(currentRepeat);
  return repeats[(index + 1) % repeats.length];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zа-яё0-9-]/gi, "")
    .replace(/-+/g, "-");
}

function getCompletedDates(tasks: Task[]) {
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

function getCurrentStreak(completedDates: string[]) {
  const completedSet = new Set(completedDates);
  let streak = 0;
  let cursor = new Date(NOW);

  while (completedSet.has(toIsoDate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function getPersonalBest(completedDates: string[]) {
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

function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
  }).format(date);
}

function formatCalendarTitle(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Выберите дату";
  }

  if (value === TODAY_ISO) {
    return "Сегодня";
  }

  const tomorrowIso = toIsoDate(addDays(NOW, 1));
  if (value === tomorrowIso) {
    return "Завтра";
  }

  return formatDisplayDate(value);
}
