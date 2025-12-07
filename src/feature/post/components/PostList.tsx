"use client";

import { usePathname } from "next/navigation";
import { type FC, useMemo } from "react";
import { PostListItem } from "@/feature/post/components/PostListItem";
import type { PostForListView } from "@/feature/post/type";
import { cn } from "@/lib/utils";

type PostListProps = {
  posts: PostForListView[];
  year: string;
  isMobile?: boolean;
};

export const PostList: FC<PostListProps> = ({ posts, isMobile, year }) => {
  const pathname = usePathname();

  const memoizedPosts = useMemo(() => {
    return posts.map((post) => {
      const isActive = pathname === `/posts/${year}/${post.id}`;

      return (
        <PostListItem
          key={post.id}
          year={year}
          post={post}
          isMobile={isMobile}
          isActive={isActive}
        />
      );
    });
  }, [posts, pathname, isMobile, year]);

  return (
    <div className={cn(!isMobile && "flex flex-col gap-1 text-sm")}>
      {memoizedPosts}
    </div>
  );
};
