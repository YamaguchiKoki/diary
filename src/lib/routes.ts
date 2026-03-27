/**
 * ルート定義モジュール
 * 型安全なURL生成を提供します。
 *
 * @example
 * import { routes } from '@/lib/routes';
 *
 * routes.home()                      // "/"
 * routes.books.index()               // "/books"
 * routes.books.detail("abc123")      // "/books/abc123"
 * routes.posts.year(2024)            // "/posts/2024"
 * routes.posts.detail(2024, "id")    // "/posts/2024/id"
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
     * @param topic - フィルタリングするトピック（オプション）
     * @returns 読書メモ一覧のパス
     */
    index: (topic?: string) => {
      const base = "/books";
      return topic ? `${base}?topic=${encodeURIComponent(topic)}` : base;
    },
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
