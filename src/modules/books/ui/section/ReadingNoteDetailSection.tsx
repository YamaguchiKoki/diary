import { notFound } from "next/navigation";
import { ReadingNoteDetailHeader } from "@/modules/books/ui/view/ReadingNoteDetailHeader";
import { ReadingNoteDetailView } from "@/modules/books/ui/view/ReadingNoteDetailView";
import { getReadingNote } from "@/modules/notion/service/api";

export type ReadingNoteDetailSectionProps = {
  noteId: string;
  goBackLink: string;
};

export async function ReadingNoteDetailSection({
  noteId,
  goBackLink,
}: ReadingNoteDetailSectionProps) {
  const note = await getReadingNote(noteId);

  if (!note) {
    notFound();
  }

  return (
    <>
      <ReadingNoteDetailHeader title={note.title} goBackLink={goBackLink} />
      <ReadingNoteDetailView note={note} />
    </>
  );
}
