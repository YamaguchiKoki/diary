import { ScrollArea } from "@/components/layouts/ScrollArea";
import { FloatingHeader } from "@/components/ui/FloatingHeader";
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
  const title = decodedTopic;

  return (
    <ScrollArea className="bg-white h-screen overflow-x-hidden overflow-y-auto">
      <FloatingHeader title={title} />
      <div className="py-4 lg:max-w-4xl lg:mx-auto lg:px-4">
        <ReadingNoteListSection topic={decodedTopic} />
      </div>
    </ScrollArea>
  );
}
