import { type FC, Suspense } from "react";
import { ErrorBoundary } from "@/components/layouts/ErrorBoundary";
import { getPostsByYear } from "@/modules/notion/service/api";
import type { PostForListView } from "@/modules/posts/types";
import {
  PostListView,
  PostListViewSkelton,
} from "@/modules/posts/ui/view/post-list";

/**
 * PostListSectionコンポーネントのプロパティ。
 */
export type PostListSectionProps = {
  /** 表示する年 */
  year: string;
  /** モバイル表示かどうか */
  isMobile?: boolean;
  /** 投稿一覧のPromise（外部から渡す場合） */
  postsPromise?: Promise<PostForListView[]>;
};

/**
 * 投稿一覧を表示するSectionコンポーネント。
 * データ取得、エラーハンドリング、サスペンスを担当します。
 *
 * @param props - コンポーネントのプロパティ
 * @returns 投稿一覧のSection
 *
 * @example
 * // 内部でデータを取得する場合
 * <PostListSection year="2024" />
 *
 * @example
 * // 外部からPromiseを渡す場合（Promise共有）
 * const postsPromise = getPostsByYear(2024);
 * <PostListSection year="2024" postsPromise={postsPromise} />
 */
export const PostListSection: FC<PostListSectionProps> = ({
  year,
  isMobile,
  postsPromise,
}) => {
  const promise = postsPromise ?? getPostsByYear(Number(year));

  return (
    <ErrorBoundary>
      <Suspense fallback={<PostListViewSkelton />}>
        <PostListView postsPromise={promise} year={year} isMobile={isMobile} />
      </Suspense>
    </ErrorBoundary>
  );
};
