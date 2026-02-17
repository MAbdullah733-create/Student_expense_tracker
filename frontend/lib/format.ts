const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  const month = MONTHS[parseInt(m ?? "1", 10) - 1];
  return `${d} ${month} ${y}`;
}
