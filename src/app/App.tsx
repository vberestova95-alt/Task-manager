import {
  CalendarScreen,
  CreateScreen,
  ProgressScreen,
  TabsSettingsModal,
  TasksScreen,
  useTaskManager
} from "@/features/task-manager";

export default function App() {
  const { screen, isFlatLayout, tasksScreen, createScreen, calendarScreen, progressScreen, tabsModal } =
    useTaskManager();
  const { isOpen: isTabsModalOpen, ...tabsModalProps } = tabsModal;

  return (
    <div className="shell">
      <div className={`phone-screen ${isFlatLayout ? "phone-screen--flat" : ""}`}>
        {screen === "tasks" ? <TasksScreen {...tasksScreen} /> : null}
        {screen === "create" ? <CreateScreen {...createScreen} /> : null}
        {screen === "calendar" ? <CalendarScreen {...calendarScreen} /> : null}
        {screen === "progress" ? <ProgressScreen {...progressScreen} /> : null}
        {isTabsModalOpen ? <TabsSettingsModal {...tabsModalProps} /> : null}
      </div>
    </div>
  );
}
