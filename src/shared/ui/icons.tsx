import {
  calendarEditIconAsset,
  progressCrystalRecordAsset,
  progressCrystalSpiritAsset,
  progressNavIconAsset
} from "@/shared/constants/assets";

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" />
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6L9 12L15 18" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9L12 15L18 9" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6L15 12L9 18" />
    </svg>
  );
}

export function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5V5.01M12 12V12.01M12 19V19.01" />
    </svg>
  );
}

export function CalendarBadgeIcon() {
  return <img src={calendarEditIconAsset} alt="" aria-hidden="true" />;
}

export function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6H14M18 6H20M10 12H20M4 12H6M4 18H12M16 18H20" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="14" cy="18" r="2" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" fill="currentColor" />
      <rect x="13" y="4" width="7" height="7" fill="currentColor" />
      <rect x="4" y="13" width="7" height="7" fill="currentColor" />
      <rect x="13" y="13" width="7" height="7" fill="currentColor" />
    </svg>
  );
}

export function ProgressGlyphIcon() {
  return (
    <span className="progress-nav-icon" aria-hidden="true">
      <img src={progressNavIconAsset} alt="" />
    </span>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5V19M5 12H19" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 12.5L10.5 16L17 9.5" />
    </svg>
  );
}

export function SmallArrowIcon({ direction }: { direction: "left" | "right" }) {
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

export function CrystalBadgeIcon() {
  return <img src={progressCrystalSpiritAsset} alt="" aria-hidden="true" />;
}

export function CrystalClusterIcon() {
  return <img src={progressCrystalRecordAsset} alt="" aria-hidden="true" />;
}
