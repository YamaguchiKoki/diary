import Link from "next/link";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ReadingNoteForListView } from "@/modules/books/types";

interface ReadingNoteListItemProps {
  note: ReadingNoteForListView;
}

export function ReadingNoteListItem({ note }: ReadingNoteListItemProps) {
  return (
    <Link
      href={routes.books.detail(note.id)}
      className={cn(
        "group flex min-w-0 flex-col justify-between gap-2 border-b px-4 py-3 transition-colors duration-200 hover:bg-gray-100",
        "lg:gap-4 lg:rounded-xl lg:border-b-0 lg:bg-gray-50 lg:p-5",
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="break-words font-semibold text-base leading-snug transition-colors duration-200 group-hover:text-primary">
          {note.title}
        </h3>

        {note.createdAt && (
          <p className="text-xs text-gray-400">
            {new Date(note.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      {note.topics.length > 0 && (
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {note.topics.map((topic) => (
            <span
              key={topic}
              className="max-w-full break-all rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-500"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
