export function addDays(days: number, from = new Date()): Date {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}
