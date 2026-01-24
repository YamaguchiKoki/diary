import { Suspense } from "react";
import { SideMenu } from "@/components/ui/SideMenu";
import { TopicFilter } from "@/modules/books/ui/view/TopicFilter";
import { getAllTopics } from "@/modules/notion/service/api";

async function TopicFilterSection() {
  const topics = await getAllTopics();
  return <TopicFilter topics={topics} />;
}

export default function BooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SideMenu title="Topics" isInner>
        <Suspense
          fallback={
            <div className="p-2 text-sm text-gray-500">読み込み中...</div>
          }
        >
          <TopicFilterSection />
        </Suspense>
      </SideMenu>

      <div className="flex-1">{children}</div>
    </div>
  );
}
