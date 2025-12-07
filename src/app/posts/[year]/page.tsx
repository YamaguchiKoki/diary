import { PostList } from "@/feature/post/components/PostList";
import { getPostsByYear } from "@/lib/content/notion/api";
import type { PostYearParams } from "@/lib/routes";

type Props = {
  params: Promise<PostYearParams>;
};

export default async function YearPage({ params }: Props) {
  const { year } = await params;
  const posts = await getPostsByYear(Number(year));

  return (
    <div className="lg:hidden">
      <PostList posts={posts} year={year} isMobile />
    </div>
  );
}
