import { type FC, Suspense } from "react";
import { getPostsByYear } from "@/modules/notion/service/api";
import {
  PostListView,
  PostListViewSkelton,
} from "@/modules/posts/ui/view/post-list";

type PostListSectionProps = {
  year: string;
  isMobile?: boolean;
};
export const PostListSection: FC<PostListSectionProps> = async ({ year }) => {
  const posts = await getPostsByYear(Number(year));
  return (
    <Suspense fallback={<PostListViewSkelton />}>
      <PostListView posts={posts} year={year} />
    </Suspense>
  );
};
