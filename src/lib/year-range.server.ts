"use cache";

import { cacheLife } from "next/cache";

const START_YEAR = 2025;

export const getCachedYearRange = async (
  endYear?: number,
): Promise<number[]> => {
  cacheLife("days");
  const upper = endYear ?? new Date().getUTCFullYear();
  const years: number[] = [];
  for (let y = upper; y >= START_YEAR; y--) years.push(y);
  return years;
};
