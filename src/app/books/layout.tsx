import { SideMenu } from "@/components/ui/SideMenu";
import { getAllTopics } from "@/modules/books/service/api";
import { TopicFilter } from "@/modules/books/ui/view/TopicFilter";

type TopicFilterSectionProps = {
  activeTopic?: string;
};

async function TopicFilterSection({ activeTopic }: TopicFilterSectionProps) {
  try {
    const topics = await getAllTopics();
    return <TopicFilter topics={topics} activeTopic={activeTopic} />;
  } catch {
    return (
      <p className="px-2 py-1 text-sm text-gray-500">
        トピックを読み込めませんでした。
      </p>
    );
  }
}

type BooksLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id?: string;
    topic?: string;
  }>;
};

export default async function BooksLayout({
  children,
  params,
}: BooksLayoutProps) {
  const { topic } = await params;
  const activeTopic = topic ? decodeURIComponent(topic) : undefined;

  return (
    <>
      <SideMenu title="Topics" isInner>
        <TopicFilterSection activeTopic={activeTopic} />
      </SideMenu>
      <div className="flex-1 lg:bg-dots">{children}</div>
    </>
  );
}
