import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy', { locale: pl });
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM', { locale: pl });
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: pl });
}

export function getExpiryLabel(dateStr: string | null): { text: string; color: string } | null {
  if (!dateStr) return null;
  const days = daysUntil(dateStr);
  if (days < 0) return { text: 'Przeterminowane', color: '#EF4444' };
  if (days === 0) return { text: 'Wygasa dzisiaj', color: '#EF4444' };
  if (days <= 3) return { text: `Wygasa za ${days} dni`, color: '#F59E0B' };
  return null;
}
