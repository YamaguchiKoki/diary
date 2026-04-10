import { TagIcon } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type TopicFilterProps = {
  topics: string[];
  activeTopic?: string;
};

export function TopicFilter({ topics, activeTopic }: TopicFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      {topics.map((topic) => {
        const isActive = activeTopic === topic;
        return (
          <Link
            key={topic}
            href={routes.books.topic(topic)}
            className={cn(
              "group flex items-center justify-between rounded-lg p-2",
              isActive ? "bg-primary text-white" : "hover:bg-gray-200",
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
