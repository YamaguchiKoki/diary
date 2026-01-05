"use client";
import type { FC } from "react";
import { cn } from "@/lib/utils";
import type { PostForListView } from "@/modules/posts/types";
import { PostListItem } from "@/modules/posts/ui/view/post-list-item";

type PostListViewProps = {
  posts: PostForListView[];
  year: string;
  isMobile?: boolean;
};

export const PostListView: FC<PostListViewProps> = ({
  posts,
  year,
  isMobile,
}) => {
  return (
    <div className={cn(!isMobile && "flex flex-col gap-1 text-sm")}>
      {posts.map((post) => {
        return (
          <PostListItem
            key={post.id}
            year={year}
            post={post}
            isMobile={isMobile}
          />
        );
      })}
    </div>
  );
};

export const PostListViewSkelton: FC = () => {
  return <div>Skelton</div>;
};
