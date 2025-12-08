// src/components/ui/Spacer.tsx
import { cn } from "@/lib/utils";

type SpacerSize = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32;

interface SpacerProps {
  size?: SpacerSize;
  axis?: "vertical" | "horizontal";
  className?: string;
}

const sizeMap: Record<SpacerSize, string> = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
  32: "128px",
};

export function Spacer({
  size = 4,
  axis = "vertical",
  className,
}: SpacerProps) {
  const sizeValue = sizeMap[size];

  return (
    <div
      className={cn("shrink-0", className)}
      style={{
        width: axis === "horizontal" ? sizeValue : 1,
        height: axis === "vertical" ? sizeValue : 1,
      }}
    />
  );
}
