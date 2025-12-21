import { Suspense } from "react";
import { ScrollArea } from "@/components/layouts/ScrollArea";
import { FloatingHeader } from "@/feature/post/components/FloatingHeader";
import { PostList } from "@/feature/post/components/PostList";
import { getPostsByYear } from "@/lib/content/notion/api";
import type { PostYearParams } from "@/lib/routes";

type Props = {
  params: Promise<PostYearParams>;
};

export default async function YearPage({ params }: Props) {
  return (
    <Suspense fallback={<p>loading</p>}>
      <YearPageContent params={params} />
    </Suspense>
  );
}

async function YearPageContent({ params }: Props) {
  "use cache";

  const { year } = await params;
  const posts = await getPostsByYear(Number(year));

  return (
    <ScrollArea className="lg:hidden">
      <FloatingHeader title={`${year}年の日記`} />
      <PostList posts={posts} year={year} isMobile />
    </ScrollArea>
  );
}
