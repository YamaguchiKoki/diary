import Link from "next/link";
import { routes } from "@/lib/routes";
import type { ReadingNoteForListView } from "@/modules/books/types";

interface ReadingNoteListItemProps {
  note: ReadingNoteForListView;
}

export function ReadingNoteListItem({ note }: ReadingNoteListItemProps) {
  return (
    <Link
      href={routes.books.detail(note.id)}
      className="group flex flex-col justify-between gap-4 rounded-xl bg-gray-50 p-5 transition-all duration-200 hover:bg-gray-100"
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors duration-200">
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
        <div className="flex flex-wrap gap-1.5">
          {note.topics.map((topic) => (
            <span
              key={topic}
              className="text-xs border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
