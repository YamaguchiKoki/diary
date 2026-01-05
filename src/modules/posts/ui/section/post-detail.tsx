import { type FC, Suspense } from "react";
import { ErrorBoundary } from "@/components/layouts/ErrorBoundary";
import { getPost } from "@/modules/notion/service/api";
import {
  PostDetailView,
  PostDetailViewSkelton,
} from "@/modules/posts/ui/view/post-detail";

type PostDetailProps = {
  postId: string;
};

export const PostDetailSection: FC<PostDetailProps> = ({ postId }) => {
  const postPromise = getPost(postId);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PostDetailViewSkelton />}>
        <PostDetailView postPromise={postPromise} />
      </Suspense>
    </ErrorBoundary>
  );
};
