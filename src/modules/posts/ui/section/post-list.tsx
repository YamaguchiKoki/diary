import { getPostsByYear } from "@/modules/posts/service/api";
import { PostListView } from "@/modules/posts/ui/view/post-list";

export type PostListSectionProps = {
  year: string;
  isMobile?: boolean;
};

export async function PostListSection({
  year,
  isMobile,
}: PostListSectionProps) {
  const posts = await getPostsByYear(Number(year));

  return <PostListView posts={posts} year={year} isMobile={isMobile} />;
}
