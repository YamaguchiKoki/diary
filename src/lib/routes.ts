/**
 * ルート定義モジュール
 * 型安全なURL生成を提供します。
 *
 * @example
 * import { routes } from '@/lib/routes';
 *
 * routes.home()                      // "/"
 * routes.books.index()               // "/books"
 * routes.books.topic("react")        // "/books/topic/react"
 * routes.books.detail("abc123")      // "/books/abc123"
 * routes.posts.year(2024)            // "/posts/2024"
 * routes.posts.detail(2024, "id")    // "/posts/2024/id"
 * routes.trivia.index()              // "/trivia"
 * routes.trivia.detail("abc123")     // "/trivia/abc123"
 */

type Year = number;
type PostId = string;

/**
 * アプリケーション全体のルート定義
 */
export const routes = {
  /**
   * ホームページへのルート
   * @returns "/" のパス
   */
  home: () => "/" as const,

  /**
   * 読書メモ関連のルート
   */
  books: {
    /**
     * 読書メモ一覧ページへのルート
     * @returns 読書メモ一覧のパス
     */
    index: () => "/books" as const,
    /**
     * トピック別の読書メモ一覧ページへのルート
     * @param topic - フィルタリングするトピック
     * @returns トピック別読書メモ一覧のパス
     */
    topic: (topic: string) =>
      `/books/topic/${encodeURIComponent(topic)}` as const,
    /**
     * 読書メモ詳細ページへのルート
     * @param id - 読書メモのID
     * @returns 読書メモ詳細のパス
     */
    detail: (id: string) => `/books/${id}` as const,
  },

  /**
   * 投稿関連のルート
   */
  posts: {
    /**
     * 年別投稿一覧ページへのルート
     * @param year - 表示する年
     * @returns 年別投稿一覧のパス
     */
    year: (year: Year) => `/posts/${year}` as const,
    /**
     * 投稿詳細ページへのルート
     * @param year - 投稿の年
     * @param id - 投稿のID
     * @returns 投稿詳細のパス
     */
    detail: (year: Year, id: PostId) => `/posts/${year}/${id}` as const,
  },

  /**
   * 豆知識関連のルート
   */
  trivia: {
    /**
     * 豆知識一覧ページへのルート
     * @returns 豆知識一覧のパス
     */
    index: () => "/trivia" as const,
    /**
     * 豆知識詳細ページへのルート
     * @param id - 豆知識のID
     * @returns 豆知識詳細のパス
     */
    detail: (id: string) => `/trivia/${id}` as const,
  },
} as const;

/**
 * 年別投稿ページのパラメータ型
 */
export type PostYearParams = {
  /** 年（文字列形式） */
  year: string;
};

/**
 * 投稿詳細ページのパラメータ型
 */
export type PostDetailParams = {
  /** 年（文字列形式） */
  year: string;
  /** 投稿ID */
  id: string;
};

/**
 * 読書メモトピックページのパラメータ型
 */
export type BookTopicParams = {
  /** トピック */
  topic: string;
};
