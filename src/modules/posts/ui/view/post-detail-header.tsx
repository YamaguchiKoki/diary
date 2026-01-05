import { notFound } from "next/navigation";
import { type FC, use } from "react";
import { FloatingHeader } from "@/components/ui/FloatingHeader";
import type { Post } from "@/modules/notion/types";

type PostDetailHeaderProps = {
  postPromise: Promise<Post | null>;
  goBackLink: string;
};

export const PostDetailHeader: FC<PostDetailHeaderProps> = ({
  postPromise,
  goBackLink,
}) => {
  const post = use(postPromise);

  if (!post) {
    notFound();
  }

  return <FloatingHeader scrollTitle={post.title} goBackLink={goBackLink} />;
};
