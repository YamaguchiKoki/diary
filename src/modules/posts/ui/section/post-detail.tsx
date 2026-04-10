import { notFound } from "next/navigation";
import { getPost } from "@/modules/posts/service/api";
import { PostDetailView } from "@/modules/posts/ui/view/post-detail";
import { PostDetailHeader } from "@/modules/posts/ui/view/post-detail-header";

export type PostDetailSectionProps = {
  postId: string;
  goBackLink: string;
};

export async function PostDetailSection({
  postId,
  goBackLink,
}: PostDetailSectionProps) {
  const post = await getPost(postId);

  if (!post) {
    notFound();
  }

  return (
    <>
      <PostDetailHeader title={post.title} goBackLink={goBackLink} />
      <PostDetailView post={post} />
    </>
  );
}
