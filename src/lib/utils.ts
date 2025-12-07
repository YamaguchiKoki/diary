import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const START_YEAR = 2025;
export const getYearRange = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  for (let year = currentYear; year >= START_YEAR; year--) {
    years.push(year);
  }

  return years;
};
