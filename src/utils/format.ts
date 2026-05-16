export function formatDate(d: Date): string {
  return d.toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" });
}

export function formatToday(): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date().toLocaleDateString("vi-VN", opts);
}
