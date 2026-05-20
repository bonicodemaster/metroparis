import clsx, { type ClassValue } from "clsx";

/** clsx re-export pour rester court dans les composants. */
export function cn(...args: ClassValue[]): string {
  return clsx(...args);
}
