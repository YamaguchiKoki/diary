import Link from "next/link";
import type { FC } from "react";
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover";
import type { Post } from "@/lib/content/types";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1663765970236-f2acfde22237?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

type PostCardProps = {
  post: Omit<Post, "blocks">;
};

export const PostCard: FC<PostCardProps> = ({
  post: { id, thumbnail, title, publishedAt },
}) => {
  return (
    <Link href={`/posts/${id}`} className="block h-64 md:h-72">
      <DirectionAwareHover
        imageUrl={thumbnail ?? PLACEHOLDER_IMAGE}
        className="w-full h-full"
      >
        <p className="font-bold text-xl">{title}</p>
        <p className="font-normal text-sm">{publishedAt}</p>
      </DirectionAwareHover>
    </Link>
  );
};
