import { notFound } from "next/navigation";
import { ReadingNoteDetailView } from "@/modules/books/ui/view/ReadingNoteDetailView";
import { getReadingNote } from "@/modules/notion/service/api";

export type ReadingNoteDetailSectionProps = {
  noteId: string;
};

export async function ReadingNoteDetailSection({
  noteId,
}: ReadingNoteDetailSectionProps) {
  const note = await getReadingNote(noteId);

  if (!note) {
    notFound();
  }

  return <ReadingNoteDetailView note={note} />;
}
