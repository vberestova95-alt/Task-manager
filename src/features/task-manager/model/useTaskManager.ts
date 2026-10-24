import { useEffect, useState } from "react";

import {
  NOW,
  TODAY_ISO,
  addDays,
  addMonths,
  startOfMonth,
  toIsoDate
} from "@/shared/lib/date";
import { slugify } from "@/shared/lib/string";

import { defaultDraft, initialNotificationSettings, initialTabs, initialTasks } from "./data";
import { nextRepeat } from "./repeat";
import { getCompletedDates, getCurrentStreak, getPersonalBest } from "./selectors";
import { useTelegramUser } from "./useTelegramUser";
import type {
  AppScreen,
  CalendarMode,
  CalendarTarget,
  DraftTask,
  NotificationSettings,
  TabItem,
  Task,
  TaskCategory
} from "./types";

export function useTaskManager() {
  const telegramUser = useTelegramUser();
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
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [isCelebratingDay, setIsCelebratingDay] = useState(false);
  const [celebrationBurst, setCelebrationBurst] = useState(0);

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

  function closeTabsSettings() {
    setTabsSettingsOpen(false);
    setNewTabLabel("");
    setDraggedTabId(null);
  }

  function addTab() {
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
  }

  function deleteTab(tabId: string) {
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
  }

  function moveTab(targetTabId: string) {
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
  }

  return {
    screen,
    isFlatLayout: screen === "create" || screen === "calendar",
    tasksScreen: {
      activeCategory,
      celebrationBurst,
      filterDate,
      isCelebratingDay,
      tabs,
      onCategoryChange: setActiveCategory,
      tasks: filteredTasks,
      onToggleTask: toggleTask,
      onOpenCreate: openCreateScreen,
      onOpenCalendar: openFilterCalendar,
      onOpenTabsSettings: () => setTabsSettingsOpen(true),
      onOpenProgress: () => setScreen("progress"),
      telegramUser
    },
    createScreen: {
      activeCategory: draft.category,
      tabs,
      draft,
      notificationSettings,
      onBack: () => setScreen("tasks"),
      onCategoryChange: (category: TaskCategory) =>
        setDraft((currentDraft) => ({ ...currentDraft, category })),
      onCalendar: openDraftCalendar,
      onOpenTabsSettings: () => setTabsSettingsOpen(true),
      onDraftChange: (field: "title" | "description", value: string) =>
        setDraft((currentDraft) => ({ ...currentDraft, [field]: value })),
      onNotificationTimeChange: (value: string) =>
        setNotificationSettings((currentSettings) => ({
          ...currentSettings,
          time: value
        })),
      onNotificationDateClick: openNotificationCalendar,
      onRepeatChange: () =>
        setNotificationSettings((currentSettings) => ({
          ...currentSettings,
          repeat: nextRepeat(currentSettings.repeat)
        })),
      onSubmit: submitTask
    },
    calendarScreen: {
      mode: calendarMode,
      selectedDate: calendarSelection,
      visibleMonth,
      onBack: () => setScreen(calendarMode === "filter" ? "tasks" : "create"),
      onCancel: () => setScreen(calendarMode === "filter" ? "tasks" : "create"),
      onApply: () => {
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
      },
      onSelectDate: setCalendarSelection,
      onToday: () => {
        setVisibleMonth(startOfMonth(NOW));
        setCalendarSelection(TODAY_ISO);
      },
      onTomorrow: () => {
        const tomorrow = addDays(NOW, 1);
        const tomorrowIso = toIsoDate(tomorrow);
        setVisibleMonth(startOfMonth(tomorrow));
        setCalendarSelection(tomorrowIso);
      },
      onClear: () => setCalendarSelection(""),
      onPrevMonth: () => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1)),
      onNextMonth: () => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))
    },
    progressScreen: {
      currentStreak,
      personalBest,
      visibleMonth: progressMonth,
      completedDates,
      onOpenTasks: () => setScreen("tasks"),
      onOpenCreate: openCreateScreen,
      onPrevMonth: () => setProgressMonth((currentMonth) => addMonths(currentMonth, -1)),
      onNextMonth: () => setProgressMonth((currentMonth) => addMonths(currentMonth, 1)),
      telegramUser
    },
    tabsModal: {
      isOpen: tabsSettingsOpen,
      tabs,
      draggedTabId,
      newTabLabel,
      onClose: closeTabsSettings,
      onNewTabLabelChange: setNewTabLabel,
      onAddTab: addTab,
      onDeleteTab: deleteTab,
      onDragStart: setDraggedTabId,
      onDragEnd: () => setDraggedTabId(null),
      onMoveTab: moveTab
    }
  };
}
