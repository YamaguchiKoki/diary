import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const START_YEAR = 2025;
const CURRENT_YEAR = 2026;
export const getYearRange = (): number[] => {
  const years: number[] = [];
  for (let year = CURRENT_YEAR; year >= START_YEAR; year--) {
    years.push(year);
  }
  return years;
};
