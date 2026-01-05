import { notFound } from "next/navigation";
import { type FC, Suspense } from "react";
import { getPost } from "@/modules/notion/service/api";
import {
  PostDetailView,
  PostDetailViewSkelton,
} from "@/modules/posts/ui/view/post-detail";

type PostDetailProps = {
  postId: string;
};

export const PostDetailSection: FC<PostDetailProps> = async ({ postId }) => {
  const post = await getPost(postId);

  if (!post) {
    notFound();
  }
  return (
    <Suspense fallback={<PostDetailViewSkelton />}>
      <PostDetailView post={post} />
    </Suspense>
  );
};
