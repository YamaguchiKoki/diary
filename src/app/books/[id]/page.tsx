import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ReadingNoteDetailView } from "@/modules/books/ui/view/ReadingNoteDetailView";
import { getReadingNote, getReadingNotes } from "@/modules/notion/service/api";

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

async function BookDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const note = await getReadingNote(id);

  if (!note) {
    notFound();
  }

  return <ReadingNoteDetailView note={note} />;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      }
    >
      <BookDetailContent paramsPromise={params} />
    </Suspense>
  );
}
