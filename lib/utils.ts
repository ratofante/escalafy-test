import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safely parse a DB value to a JS number (decimals come back as strings from pg)
export function toNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}
