export function formatThreadUpdatedAtLocal(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

export function formatThreadUpdatedAtDisplay(isoDateTime: string): string {
  return formatThreadUpdatedAtLocal(new Date(isoDateTime));
}
