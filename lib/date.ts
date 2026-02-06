function parseDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function getWeekRange(dateString: string) {
  const date = parseDate(dateString);
  const day = date.getUTCDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + offsetToMonday);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    start: monday,
    end: sunday
  };
}

export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
