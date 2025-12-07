import type { FC, ReactNode } from "react";
import { SCROLL_AREA_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ScrollAreaProps = {
  useScrollAreaId?: boolean;
  className: string;
  children: ReactNode;
};

export const ScrollArea: FC<ScrollAreaProps> = ({
  useScrollAreaId = false,
  className,
  children,
}) => (
  <div
    {...(useScrollAreaId && { id: SCROLL_AREA_ID })}
    className={cn("scrollable-area relative flex w-full flex-col", className)}
  >
    {children}
  </div>
);
