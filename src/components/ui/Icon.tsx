import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

export type IconName =
  | 'leaf' | 'spark' | 'calendar' | 'chart' | 'target' | 'check'
  | 'balance' | 'trend-down' | 'trend-up' | 'protein' | 'low-carb'
  | 'keto' | 'plant' | 'vegetarian' | 'water' | 'meal' | 'supplement'
  | 'sun' | 'sleep' | 'stress' | 'swap' | 'info';

const paths: Record<IconName, ReactNode> = {
  leaf: <><path d="M19.5 4.5C12 4.5 6.5 8 5 14.5c3.8.5 7.2-.7 9.4-3.6"/><path d="M5 19.5c0-4.8 3-8.4 8.8-10.9"/></>,
  spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"/></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  target: <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="m12 12 7-7M16 5h3v3"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  balance: <><path d="M12 4v16M6 7h12M4 20h16"/><path d="m6 7-3 6h6L6 7Zm12 0-3 6h6l-3-6Z"/></>,
  'trend-down': <path d="m4 7 6 6 4-4 6 6M15 15h5v-5"/>,
  'trend-up': <path d="m4 17 6-6 4 4 6-6M15 9h5v5"/>,
  protein: <><path d="M8 4c2 2 2 4 0 6s-2 4 0 6 4 2 6 0 2-4 0-6-2-4 0-6"/><path d="M6 20h12"/></>,
  'low-carb': <><path d="M5 17c2-7 7-10 14-10-1 7-5 11-12 11"/><path d="m5 20 8-8"/></>,
  keto: <><path d="M12 3c3.5 4 6 7 6 11a6 6 0 0 1-12 0c0-4 2.5-7 6-11Z"/><path d="M9 15c.7 1.5 1.7 2 3 2"/></>,
  plant: <><path d="M12 21V9"/><path d="M12 13C6 13 4 10 4 5c5 0 8 2 8 8Zm0 3c5 0 8-2 8-7-5 0-8 2-8 7Z"/></>,
  vegetarian: <><circle cx="12" cy="12" r="8"/><path d="M8 15c4-1 6-4 7-8-4 0-7 2-7 6M8 17v-4"/></>,
  water: <path d="M12 3c3.5 4.3 6 7.2 6 11a6 6 0 1 1-12 0c0-3.8 2.5-6.7 6-11Z"/>,
  meal: <><path d="M7 3v8M4 3v5c0 2 1 3 3 3s3-1 3-3V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"/></>,
  supplement: <><path d="M8 5a4 4 0 0 1 5.7 0l5.3 5.3a4 4 0 0 1-5.7 5.7L8 10.7A4 4 0 0 1 8 5Z"/><path d="m10.7 8 5.3 5.3"/></>,
  sun: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></>,
  sleep: <><path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z"/><path d="M15 5h4l-4 4h4"/></>,
  stress: <><circle cx="12" cy="12" r="8.5"/><path d="M8.5 10h.01M15.5 10h.01M8.5 16c1-2 6-2 7 0"/></>,
  swap: <><path d="M4 8h13l-3-3M20 16H7l3 3"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn('h-5 w-5', className)}>{paths[name]}</svg>;
}
