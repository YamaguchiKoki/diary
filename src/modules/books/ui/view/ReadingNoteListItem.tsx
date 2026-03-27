"use client";

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
      className="link-card flex flex-col gap-2 p-4 hover:bg-gray-50"
    >
      <h3 className="font-semibold text-lg">{note.title}</h3>

      {note.createdAt && (
        <p className="text-sm text-gray-500">
          {new Date(note.createdAt).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}

      {note.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.topics.map((topic) => (
            <span
              key={topic}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
