import "./TopBar.css";

import { ArrowLeftIcon, ChevronDownIcon, CloseIcon, MoreVerticalIcon } from "@/shared/ui/icons";

type TopBarProps = {
  mode: "close" | "back";
  onBack?: () => void;
};

export function TopBar({ mode, onBack }: TopBarProps) {
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
