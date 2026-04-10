import { ScrollArea } from "@/components/layouts/ScrollArea";
import { routes } from "@/lib/routes";
import { getReadingNotes } from "@/modules/books/service/api";
import { ReadingNoteDetailSection } from "@/modules/books/ui/section/ReadingNoteDetailSection";

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

  return (
    <ScrollArea className="bg-white h-screen overflow-y-auto" useScrollAreaId>
      <ReadingNoteDetailSection noteId={id} goBackLink={routes.books.index()} />
    </ScrollArea>
  );
}
