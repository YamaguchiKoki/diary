import type { FC } from "react";
import { PageTitle } from "@/components/ui/PageTitle";
import type { Post } from "@/modules/notion/types";
import { BlocksRenderer } from "@/modules/notion/ui/view/BlocksRenderer";

export type PostDetailViewProps = {
  post: Post;
};

export const PostDetailView: FC<PostDetailViewProps> = ({ post }) => {
  return (
    <div className="content-wrapper @container/writing px-4 lg:py-20 lg:px-16">
      <article className="content">
        <PageTitle
          title={post.title}
          subtitle={<time className="text-gray-400">{post.publishedAt}</time>}
          className="mb-6 flex flex-col gap-3"
        />
        <div>
          <BlocksRenderer blocks={post.blocks} />
        </div>
      </article>
    </div>
  );
};
