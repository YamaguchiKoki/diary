import type { FC } from "react";
import { PageTitle } from "@/components/ui/PageTitle";
import type { Post } from "@/modules/notion/types";
import { BlockRenderer } from "@/modules/notion/ui/view/BlockRenderer";

type PostDetailProps = {
  post: Post;
};

export const PostDetailView: FC<PostDetailProps> = ({ post }) => {
  return (
    <div className="content-wrapper @container/writing px-4 lg:py-20 lg:px-16">
      <article className="content">
        <PageTitle
          title={post.title}
          subtitle={<time className="text-gray-400">{post.publishedAt}</time>}
          className="mb-6 flex flex-col gap-3"
        />
        <div>
          {post.blocks.map((block, i) => (
            <BlockRenderer key={`${block.type}-${i}`} block={block} />
          ))}
        </div>
      </article>
    </div>
  );
};

export const PostDetailViewSkelton = () => {
  return <p>loading</p>;
};
