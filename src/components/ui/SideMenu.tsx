"use client";

import { type FC, type ReactNode, useMemo } from "react";
import { ScrollArea } from "@/components/layouts/ScrollArea";
import { cn } from "@/lib/utils";

type SideMenuProps = {
  title?: string;
  isInner?: boolean;
  className?: string;
  children: ReactNode;
};

export const SideMenu: FC<SideMenuProps> = ({
  title,
  isInner,
  children,
  className,
}) => {
  const memoizedScrollArea = useMemo(
    () => (
      <ScrollArea
        className={cn(
          "hidden bg-zinc-50 lg:flex lg:flex-col lg:border-r",
          "lg:h-screen lg:sticky lg:top-0",
          isInner ? "lg:w-80 xl:w-96" : "lg:w-60 xl:w-72",
          className,
        )}
      >
        {title && (
          <div className="sticky top-0 z-10 border-b bg-zinc-50 px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-tight">
                {title}
              </span>
              <div className="flex items-center gap-2"></div>
            </div>
          </div>
        )}
        <div className="bg-zinc-50 p-3 flex-1 overflow-y-auto">{children}</div>
      </ScrollArea>
    ),
    [isInner, title, children, className],
  );

  return memoizedScrollArea;
};
