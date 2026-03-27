import { type FC, Suspense } from "react";
import { ErrorBoundary } from "@/components/layouts/ErrorBoundary";
import { getPost } from "@/modules/notion/service/api";
import type { Post } from "@/modules/notion/types";
import {
  PostDetailView,
  PostDetailViewSkelton,
} from "@/modules/posts/ui/view/post-detail";

/**
 * PostDetailSectionコンポーネントのプロパティ。
 */
export type PostDetailSectionProps = {
  /** 投稿のID */
  postId: string;
  /** 投稿詳細のPromise（外部から渡す場合） */
  postPromise?: Promise<Post | null>;
};

/**
 * 投稿詳細を表示するSectionコンポーネント。
 * データ取得、エラーハンドリング、サスペンスを担当します。
 *
 * @param props - コンポーネントのプロパティ
 * @returns 投稿詳細のSection
 *
 * @example
 * // 内部でデータを取得する場合
 * <PostDetailSection postId="abc123" />
 *
 * @example
 * // 外部からPromiseを渡す場合（Promise共有）
 * const postPromise = getPost("abc123");
 * <PostDetailSection postId="abc123" postPromise={postPromise} />
 */
export const PostDetailSection: FC<PostDetailSectionProps> = ({
  postId,
  postPromise,
}) => {
  const promise = postPromise ?? getPost(postId);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PostDetailViewSkelton />}>
        <PostDetailView postPromise={promise} />
      </Suspense>
    </ErrorBoundary>
  );
};
