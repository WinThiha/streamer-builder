export function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatRating(rating: number | null | undefined): string | null {
  if (rating === null || rating === undefined || rating <= 0) return null;
  return rating.toFixed(1);
}

export function formatYear(date: string | null | undefined): string | null {
  if (!date) return null;
  return date.slice(0, 4);
}
