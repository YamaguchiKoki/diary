import { Suspense } from "react";
import { ErrorBoundary } from "@/components/layouts/ErrorBoundary";
import { SideMenu } from "@/components/ui/SideMenu";
import { Spinner } from "@/components/ui/spinner";
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
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex justify-center p-4">
                <Spinner className="size-5" />
              </div>
            }
          >
            <TopicFilterSection />
          </Suspense>
        </ErrorBoundary>
      </SideMenu>

      <div className="flex-1">{children}</div>
    </div>
  );
}
