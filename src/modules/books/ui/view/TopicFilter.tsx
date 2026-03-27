"use client";

import { TagIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface TopicFilterProps {
  topics: string[];
}

export function TopicFilter({ topics }: TopicFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTopic = searchParams.get("topic");

  // パスが/booksでない場合は、アクティブ判定しない
  const isOnBooksPage = pathname === "/books";

  return (
    <div className="flex flex-col gap-1">
      <Link
        href={routes.books.index()}
        className={cn(
          "group flex items-center justify-between rounded-lg p-2",
          isOnBooksPage && !currentTopic ? "bg-gray-200" : "hover:bg-gray-200",
        )}
      >
        <span className="flex items-center gap-2">
          <TagIcon size={16} />
          <span className="font-medium">All</span>
        </span>
      </Link>

      {topics.map((topic) => {
        const isActive = isOnBooksPage && currentTopic === topic;
        return (
          <Link
            key={topic}
            href={routes.books.index(topic)}
            className={cn(
              "group flex items-center justify-between rounded-lg p-2",
              isActive ? "bg-gray-200" : "hover:bg-gray-200",
            )}
          >
            <span className="flex items-center gap-2">
              <TagIcon size={16} />
              <span className="font-medium">{topic}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
