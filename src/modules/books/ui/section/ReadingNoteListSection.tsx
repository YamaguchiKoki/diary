import { PageTitle } from "@/components/ui/PageTitle";
import { getReadingNotes } from "@/modules/books/service/api";
import { ReadingNoteListView } from "@/modules/books/ui/view/ReadingNoteListView";

export type ReadingNoteListSectionProps = {
  topic?: string;
};

export async function ReadingNoteListSection({
  topic,
}: ReadingNoteListSectionProps) {
  const notes = await getReadingNotes({ topic });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageTitle
        title={topic ?? "読書メモ"}
        subtitle={
          <p className="text-gray-600 mt-2">{notes.length}件の読書メモ</p>
        }
      />
      <ReadingNoteListView notes={notes} />
    </div>
  );
}
