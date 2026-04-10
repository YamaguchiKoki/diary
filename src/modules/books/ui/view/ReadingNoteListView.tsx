import { cn } from "@/lib/utils";
import type { ReadingNoteForListView } from "@/modules/books/types";
import { ReadingNoteListItem } from "./ReadingNoteListItem";

type ReadingNoteListViewProps = {
  notes: ReadingNoteForListView[];
};

export function ReadingNoteListView({ notes }: ReadingNoteListViewProps) {
  return (
    <div className={cn("flex flex-col", "lg:grid lg:grid-cols-2 lg:gap-4")}>
      {notes.map((note) => (
        <ReadingNoteListItem key={note.id} note={note} />
      ))}
    </div>
  );
}
