import { Suspense } from "react";
import { ScrollArea } from "@/components/layouts/ScrollArea";
import { FloatingHeader } from "@/features/post/components/FloatingHeader";
import { PostList } from "@/features/post/components/PostList";
import { getPostsByYear } from "@/lib/content/notion/api";
import type { PostYearParams } from "@/lib/routes";

type Props = {
  params: Promise<PostYearParams>;
};

export default async function YearPage({ params }: Props) {
  const { year } = await params;
  const posts = await getPostsByYear(Number(year));

  return (
    <ScrollArea className="lg:hidden">
      <FloatingHeader title={`${year}年の日記`} />
      <Suspense fallback={<p>loading</p>}>
        <PostList posts={posts} year={year} isMobile />
      </Suspense>
    </ScrollArea>
  );
}
