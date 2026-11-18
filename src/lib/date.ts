const utcDisplayFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(date: Date): string {
  return utcDisplayFormatter.format(date);
}

export function formatIsoDate(date: Date): string {
  return date.toISOString();
}
