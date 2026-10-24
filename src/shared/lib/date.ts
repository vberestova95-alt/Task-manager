export const NOW = new Date();
export const TODAY_ISO = toIsoDate(NOW);
export const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
export const MONTH_FORMATTER = new Intl.DateTimeFormat("ru-RU", { month: "long" });

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function buildCalendarRows(monthDate: Date) {
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

export function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
  }).format(date);
}

export function formatCalendarTitle(value: string) {
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
