import { PageTitle } from "@/components/ui/PageTitle";
import { ReadingNoteListView } from "@/modules/books/ui/view/ReadingNoteListView";
import { getReadingNotes } from "@/modules/notion/service/api";

export type ReadingNoteListSectionProps = {
  topic?: string;
};

export async function ReadingNoteListSection({
  topic,
}: ReadingNoteListSectionProps) {
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
