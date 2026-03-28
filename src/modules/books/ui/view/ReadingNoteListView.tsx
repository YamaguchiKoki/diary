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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {notes.map((note) => (
        <ReadingNoteListItem key={note.id} note={note} />
      ))}
    </div>
  );
}
