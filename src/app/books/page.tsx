import { ReadingNoteListSection } from "@/modules/books/ui/section/ReadingNoteListSection";

interface BooksPageProps {
  searchParams: Promise<{
    topic?: string;
  }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const { topic } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ReadingNoteListSection topic={topic} />
    </div>
  );
}
