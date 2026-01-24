type Year = number;
type PostId = string;

export const routes = {
  home: () => "/" as const,
  books: {
    index: (topic?: string) => {
      const base = "/books";
      return topic ? `${base}?topic=${encodeURIComponent(topic)}` : base;
    },
    detail: (id: string) => `/books/${id}` as const,
  },

  posts: {
    year: (year: Year) => `/posts/${year}` as const,
    detail: (year: Year, id: PostId) => `/posts/${year}/${id}` as const,
  },
} as const;

// ページコンポーネント用の params 型
export type PostYearParams = {
  year: string;
};

export type PostDetailParams = {
  year: string;
  id: string;
};
