import { ReadingNoteDetailSection } from "@/modules/books/ui/section/ReadingNoteDetailSection";
import { getReadingNotes } from "@/modules/notion/service/api";

interface BookDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const notes = await getReadingNotes();
  return notes.map((note) => ({
    id: note.id,
  }));
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;

  return <ReadingNoteDetailSection noteId={id} />;
}
