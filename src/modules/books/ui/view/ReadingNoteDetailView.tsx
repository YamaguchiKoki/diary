import Link from "next/link";
import { PageTitle } from "@/components/ui/PageTitle";
import { routes } from "@/lib/routes";
import type { ReadingNote } from "@/modules/books/types";
import { BlockRenderer } from "@/modules/notion/ui/view/BlockRenderer";

interface ReadingNoteDetailViewProps {
  note: ReadingNote;
}

export function ReadingNoteDetailView({ note }: ReadingNoteDetailViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageTitle
        title={note.title}
        subtitle={
          <div className="flex flex-col gap-3 mt-4">
            {note.createdAt && (
              <p className="text-gray-600">
                {new Date(note.createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}

            {note.topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.topics.map((topic) => (
                  <Link
                    key={topic}
                    href={routes.books.index(topic)}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            )}
          </div>
        }
      />

      <div className="prose prose-lg max-w-none">
        {note.blocks.map((block, index) => (
          <BlockRenderer key={`${block.type}-${index}`} block={block} />
        ))}
      </div>
    </div>
  );
}
