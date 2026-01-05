import { type FC, Suspense } from "react";
import { ErrorBoundary } from "@/components/layouts/ErrorBoundary";
import { getPostsByYear } from "@/modules/notion/service/api";
import {
  PostListView,
  PostListViewSkelton,
} from "@/modules/posts/ui/view/post-list";

type PostListSectionProps = {
  year: string;
  isMobile?: boolean;
};
export const PostListSection: FC<PostListSectionProps> = ({ year }) => {
  const postsPromise = getPostsByYear(Number(year));
  return (
    <ErrorBoundary>
      <Suspense fallback={<PostListViewSkelton />}>
        <PostListView postsPromise={postsPromise} year={year} />
      </Suspense>
    </ErrorBoundary>
  );
};
