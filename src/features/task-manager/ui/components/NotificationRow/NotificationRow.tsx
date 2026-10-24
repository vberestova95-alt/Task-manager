import type { ReactNode } from "react";

import "./NotificationRow.css";

export type NotificationRowProps = {
  label: string;
  value: string;
  onClick?: () => void;
  disabled?: boolean;
  action?: ReactNode;
};

export function NotificationRow({ label, value, onClick, disabled, action }: NotificationRowProps) {
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
