import { Suspense } from "react";
import { PageTitle } from "@/components/ui/PageTitle";
import { ReadingNoteListView } from "@/modules/books/ui/view/ReadingNoteListView";
import { getReadingNotes } from "@/modules/notion/service/api";

interface BooksPageProps {
  searchParams: Promise<{
    topic?: string;
  }>;
}

async function BooksContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParamsPromise;
  const notes = await getReadingNotes({ topic });

  return (
    <>
      <PageTitle
        title={topic ? `読書メモ: ${topic}` : "読書メモ"}
        subtitle={
          <p className="text-gray-600 mt-2">{notes.length}件の読書メモ</p>
        }
      />
      <ReadingNoteListView notes={notes} />
    </>
  );
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        }
      >
        <BooksContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
