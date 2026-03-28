import type { BookTopicParams } from "@/lib/routes";
import { ReadingNoteListSection } from "@/modules/books/ui/section/ReadingNoteListSection";
import { getAllTopics } from "@/modules/notion/service/api";

type Props = {
  params: Promise<BookTopicParams>;
};

export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map((topic) => ({ topic }));
}

export default async function BooksTopicPage({ params }: Props) {
  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ReadingNoteListSection topic={decodedTopic} />
    </div>
  );
}
