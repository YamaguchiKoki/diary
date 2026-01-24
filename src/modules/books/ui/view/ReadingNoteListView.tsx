import type { ReadingNoteForListView } from "@/modules/books/types";
import { ReadingNoteListItem } from "./ReadingNoteListItem";

interface ReadingNoteListViewProps {
  notes: ReadingNoteForListView[];
}

export function ReadingNoteListView({ notes }: ReadingNoteListViewProps) {
  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">読書メモが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => (
        <ReadingNoteListItem key={note.id} note={note} />
      ))}
    </div>
  );
}
