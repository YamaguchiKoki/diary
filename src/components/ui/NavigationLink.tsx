"use client";

import { ArrowUpRightIcon, AtSignIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FC, memo, type ReactNode, useMemo } from "react";

import { cn } from "@/lib/utils";

type NavigationLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
};

export const NavigationLink: FC<NavigationLinkProps> = memo(
  ({ href, label, icon }) => {
    const pathname = usePathname();
    const iconCmp = useMemo(() => icon ?? <AtSignIcon size={16} />, [icon]);

    const isInternal = href.startsWith("/");
    if (!isInternal) {
      return (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-gray-200"
        >
          <span className="inline-flex items-center gap-2 font-medium">
            {iconCmp} {label}
          </span>
          <ArrowUpRightIcon size={16} />
        </a>
      );
    }

    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "group flex items-center justify-between rounded-lg p-2",
          isActive ? "bg-primary text-white" : "hover:bg-gray-200",
        )}
        suppressHydrationWarning
      >
        <span className="flex items-center gap-2">
          {iconCmp}
          <span className={cn("font-medium", isActive && "text-white")}>
            {label}
          </span>
        </span>
      </Link>
    );
  },
);
NavigationLink.displayName = "NavigationLink";
