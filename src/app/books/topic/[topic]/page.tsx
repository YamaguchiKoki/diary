import { ScrollArea } from "@/components/layouts/ScrollArea";
import { FloatingHeader } from "@/components/ui/FloatingHeader";
import type { BookTopicParams } from "@/lib/routes";
import { getAllTopics } from "@/modules/books/service/api";
import { ReadingNoteListSection } from "@/modules/books/ui/section/ReadingNoteListSection";

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
  const title = decodedTopic;

  return (
    <ScrollArea className="bg-white h-screen overflow-x-hidden overflow-y-auto">
      <FloatingHeader title={title} />
      <ReadingNoteListSection topic={decodedTopic} />
    </ScrollArea>
  );
}
