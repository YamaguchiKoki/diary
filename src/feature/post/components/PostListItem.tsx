import { domAnimation, LazyMotion, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import type { PostForListView } from "@/feature/post/type";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type PostListItemProps = {
  isMobile?: boolean;
  year: string;
  post: PostForListView;
};

export const PostListItem: FC<PostListItemProps> = ({
  post,
  isMobile,
  year,
}) => {
  const pathname = usePathname();
  const isActive = pathname === routes.posts.detail(Number(year), post.id);
  return (
    <LazyMotion features={domAnimation}>
      <Link
        key={post.id}
        href={routes.posts.detail(Number(year), post.id)}
        className={cn(
          "flex flex-col gap-1 transition-colors duration-300",
          !isMobile && isActive ? "bg-primary text-white" : "hover:bg-gray-200",
          isMobile
            ? "border-b px-4 py-3 text-sm hover:bg-gray-100"
            : "rounded-lg p-2",
        )}
      >
        <span className="font-medium">{post.title}</span>
        <span
          className={cn(
            "transition-colors duration-300",
            isActive ? "text-slate-400" : "text-slate-500",
          )}
        >
          <time>{post.publishedAt ?? "-"}</time>{" "}
          <span>
            <m.span key={`${post.id}-views-loading`} />
          </span>
        </span>
      </Link>
    </LazyMotion>
  );
};
