import { ScrollArea } from "@/components/layouts/ScrollArea";
import { FloatingHeader } from "@/components/ui/FloatingHeader";
import { TopicFilter } from "@/modules/books/ui/view/TopicFilter";
import { getAllTopics } from "@/modules/notion/service/api";

export default async function BooksPage() {
  const topics = await getAllTopics();

  return (
    <ScrollArea className="bg-white h-screen overflow-x-hidden overflow-y-auto">
      <FloatingHeader title="読書メモ" />
      <div className="px-4 py-4 lg:hidden">
        <TopicFilter topics={topics} />
      </div>
    </ScrollArea>
  );
}
