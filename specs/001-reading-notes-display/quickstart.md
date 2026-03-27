# クイックスタート: 読書メモ表示機能の実装

**作成日**: 2026-01-24
**想定時間**: 4-5時間（テスト含む）
**前提条件**: Next.js 16, TypeScript, Notion API統合済み

## 目次

1. [環境変数の設定](#1-環境変数の設定)
2. [型定義の作成](#2-型定義の作成)
3. [データ取得関数の実装](#3-データ取得関数の実装)
4. [ルーティングの追加](#4-ルーティングの追加)
5. [UIコンポーネントの実装](#5-uiコンポーネントの実装)
6. [ページの実装](#6-ページの実装)
7. [動作確認](#7-動作確認)
8. [テストの実装と実行](#8-テストの実装と実行)

---

## 1. 環境変数の設定

### 1.1 `.env.local`に読書メモデータベースIDを追加

```bash
# .env.local
NOTION_READING_NOTES_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **取得方法**: NotionのデータベースURLから32文字のIDをコピーしてください。
> 例: `https://notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`

### 1.2 `src/lib/env.ts`にバリデーションを追加

```typescript
// src/lib/env.ts

export const env = createEnv({
  server: {
    // 既存の環境変数...
    NOTION_SECRET: z.string().min(1),
    NOTION_DATABASE_ID: z.string().length(32),
    NOTION_DATA_SOURCE_ID: z.string().uuid(),

    // 追加
    NOTION_READING_NOTES_DATABASE_ID: z.string().length(32).describe("Notion reading notes database ID")
  },
  runtimeEnv: {
    // 既存のマッピング...
    NOTION_SECRET: process.env.NOTION_SECRET,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_DATA_SOURCE_ID: process.env.NOTION_DATA_SOURCE_ID,

    // 追加
    NOTION_READING_NOTES_DATABASE_ID: process.env.NOTION_READING_NOTES_DATABASE_ID
  }
});
```

### 1.3 nuqsのインストール

```bash
npm install nuqs
```

### 1.4 テストツールのインストールとセットアップ

```bash
# Vitestのインストール
npm install -D vitest @vitejs/plugin-react jsdom

# Testing Libraryのインストール
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# MSW (Mock Service Worker) のインストール
npm install -D msw
```

**`vitest.config.ts`を作成**:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**`vitest.setup.ts`を作成**:

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

**`package.json`にテストスクリプトを追加**:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 1.5 動作確認

```bash
npm run dev
```

エラーが出ないことを確認してください。環境変数が正しく設定されていない場合、起動時にエラーが表示されます。

---

## 2. 型定義の作成

### 2.1 `modules/books/types/index.ts`を作成

```typescript
// modules/books/types/index.ts

import type { Block } from "@/modules/notion/types";

/** 読書メモの完全な情報（詳細ページ用） */
export interface ReadingNote {
  id: string;
  title: string;
  topics: string[];
  isPublic: boolean;
  createdAt: string | null;
  blocks: Block[];
}

/** 読書メモの一覧表示用（本文ブロックを除外） */
export type ReadingNoteForListView = Omit<ReadingNote, "blocks">;
```

---

## 3. データ取得関数の実装

### 3.1 `modules/notion/service/api.ts`に関数を追加

```typescript
// modules/notion/service/api.ts

import type { ReadingNote, ReadingNoteForListView } from "@/modules/books/types";
import { env } from "@/lib/env";

/** 読書メモ一覧を取得（公開のみ） */
export async function getReadingNotes(options?: { topic?: string }): Promise<ReadingNoteForListView[]> {
  "use cache";
  cacheTag("reading-notes-all");
  cacheLife("hours");

  const response = await notionClient.databases.query({
    database_id: env.NOTION_READING_NOTES_DATABASE_ID,
    filter: {
      property: "is_public",
      checkbox: { equals: true }
    },
    sorts: [
      {
        property: "created_at",
        direction: "descending"
      }
    ]
  });

  let notes = response.results.map(parseReadingNotePage);

  // トピックフィルタリング（オプション）
  if (options?.topic) {
    notes = notes.filter(note => note.topics.includes(options.topic!));
  }

  return notes;
}

/** 読書メモ詳細を取得 */
export async function getReadingNote(id: string): Promise<ReadingNote> {
  "use cache";
  cacheTag(`reading-note-${id}`);
  cacheLife("days");

  const [page, blocks] = await Promise.all([
    notionClient.pages.retrieve({ page_id: id }),
    notionClient.blocks.children.list({ block_id: id })
  ]);

  const parsedPage = parseReadingNotePage(page);

  if (!parsedPage.isPublic) {
    throw new Error("Not found");
  }

  return {
    ...parsedPage,
    blocks: blocks.results.map(parseBlock)
  };
}

/** 全トピックを取得 */
export async function getAllTopics(): Promise<string[]> {
  "use cache";
  cacheTag("reading-notes-topics");
  cacheLife("hours");

  const response = await notionClient.databases.query({
    database_id: env.NOTION_READING_NOTES_DATABASE_ID,
    filter: {
      property: "is_public",
      checkbox: { equals: true }
    }
  });

  const topicsSet = new Set<string>();
  for (const page of response.results) {
    const topics = page.properties.topic?.multi_select ?? [];
    for (const topic of topics) {
      topicsSet.add(topic.name);
    }
  }

  return Array.from(topicsSet).sort((a, b) => a.localeCompare(b, 'ja'));
}

/** Notion APIレスポンスをReadingNoteForListViewにパース */
function parseReadingNotePage(page: any): ReadingNoteForListView {
  const properties = page.properties;

  const titleProp = properties.title;
  const title = titleProp?.type === "title"
    ? titleProp.title.map((t: any) => t.plain_text).join("")
    : "無題";

  const topicProp = properties.topic;
  const topics = topicProp?.type === "multi_select"
    ? topicProp.multi_select.map((t: any) => t.name)
    : [];

  const createdAtProp = properties.created_at;
  const createdAt = createdAtProp?.type === "date"
    ? createdAtProp.date?.start ?? null
    : null;

  const isPublicProp = properties.is_public;
  const isPublic = isPublicProp?.type === "checkbox"
    ? isPublicProp.checkbox
    : false;

  return {
    id: page.id,
    title,
    topics,
    createdAt,
    isPublic
  };
}
```

---

## 4. ルーティングの追加

### 4.1 `src/lib/routes.ts`にbooksルートを追加

```typescript
// src/lib/routes.ts

export const routes = {
  home: () => "/",
  books: {
    index: (topic?: string) => {
      const base = "/books";
      return topic ? `${base}?topic=${encodeURIComponent(topic)}` : base;
    },
    detail: (id: string) => `/books/${id}`
  },
  posts: {
    year: (year: number) => `/posts/${year}`,
    detail: (year: number, id: string) => `/posts/${year}/${id}`
  }
} as const;
```

---

## 5. UIコンポーネントの実装

### 5.1 useTopicFilterカスタムフック（`modules/books/hooks/useTopicFilter.ts`）

nuqsを使ったクエリパラメータ管理のカスタムフックを作成します。

```typescript
// modules/books/hooks/useTopicFilter.ts

"use client";

import { parseAsString, useQueryState } from 'nuqs'

export function useTopicFilter() {
  const [topic, setTopic] = useQueryState(
    'topic',
    parseAsString.withDefault('')
  )

  return {
    currentTopic: topic || undefined,
    setTopic,
    clearTopic: () => setTopic(null)
  }
}
```

### 5.2 トピックフィルター（`modules/books/ui/view/TopicFilter.tsx`）

```typescript
// modules/books/ui/view/TopicFilter.tsx

"use client";

import { NavigationLink } from "@/components/ui/MenuItem";
import { routes } from "@/lib/routes";

interface TopicFilterProps {
  topics: string[];
  currentTopic?: string;
}

export function TopicFilter({ topics, currentTopic }: TopicFilterProps) {
  return (
    <div className="space-y-1">
      <NavigationLink
        href={routes.books.index()}
        isActive={!currentTopic}
      >
        All
      </NavigationLink>

      {topics.map((topic) => (
        <NavigationLink
          key={topic}
          href={routes.books.index(topic)}
          isActive={currentTopic === topic}
        >
          {topic}
        </NavigationLink>
      ))}
    </div>
  );
}
```

### 5.3 読書メモリストアイテム（`modules/books/ui/view/ReadingNoteListItem.tsx`）

```typescript
// modules/books/ui/view/ReadingNoteListItem.tsx

"use client";

import { NavigationLink } from "@/components/ui/MenuItem";
import { routes } from "@/lib/routes";
import type { ReadingNoteForListView } from "@/modules/books/types";

interface ReadingNoteListItemProps {
  note: ReadingNoteForListView;
}

export function ReadingNoteListItem({ note }: ReadingNoteListItemProps) {
  return (
    <NavigationLink href={routes.books.detail(note.id)}>
      <div>
        <h3 className="font-bold">{note.title}</h3>
        {note.createdAt && (
          <p className="text-sm text-gray-500">
            {new Date(note.createdAt).toLocaleDateString('ja-JP')}
          </p>
        )}
        {note.topics.length > 0 && (
          <div className="flex gap-1 mt-1">
            {note.topics.map((topic) => (
              <span key={topic} className="text-xs bg-gray-200 px-2 py-1 rounded">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </NavigationLink>
  );
}
```

### 5.4 読書メモ一覧ビュー（`modules/books/ui/view/ReadingNoteListView.tsx`）

```typescript
// modules/books/ui/view/ReadingNoteListView.tsx

"use client";

import type { ReadingNoteForListView } from "@/modules/books/types";
import { ReadingNoteListItem } from "./ReadingNoteListItem";
import { use } from "react";

interface ReadingNoteListViewProps {
  notesPromise: Promise<ReadingNoteForListView[]>;
}

export function ReadingNoteListView({ notesPromise }: ReadingNoteListViewProps) {
  const notes = use(notesPromise);

  if (notes.length === 0) {
    return <div className="p-4">読書メモが見つかりませんでした。</div>;
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <ReadingNoteListItem key={note.id} note={note} />
      ))}
    </div>
  );
}
```

### 5.5 読書メモ詳細ビュー（`modules/books/ui/view/ReadingNoteDetailView.tsx`）

```typescript
// modules/books/ui/view/ReadingNoteDetailView.tsx

import { PageTitle } from "@/components/ui/PageTitle";
import { BlockRenderer } from "@/modules/notion/ui/view/BlockRenderer";
import type { ReadingNote } from "@/modules/books/types";
import { routes } from "@/lib/routes";
import Link from "next/link";

interface ReadingNoteDetailViewProps {
  note: ReadingNote;
}

export function ReadingNoteDetailView({ note }: ReadingNoteDetailViewProps) {
  return (
    <div>
      <PageTitle
        title={note.title}
        subtitle={note.createdAt ? new Date(note.createdAt).toLocaleDateString('ja-JP') : undefined}
      />

      {note.topics.length > 0 && (
        <div className="flex gap-2 mb-4">
          {note.topics.map((topic) => (
            <Link key={topic} href={routes.books.index(topic)}>
              <span className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
                {topic}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="content-wrapper @container/writing">
        {note.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
```

---

## 6. ページの実装

### 6.1 レイアウト（`app/books/layout.tsx`）

**重要**: nuqsを使用するため、`NuqsAdapter`でラップする必要があります。

```typescript
// app/books/layout.tsx

import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { SideMenu } from "@/components/ui/SideMenu";
import { TopicFilter } from "@/modules/books/ui/view/TopicFilter";
import { getAllTopics } from "@/modules/notion/service/api";
import { Suspense } from "react";

export default async function BooksLayout({
  children,
  searchParams
}: {
  children: React.ReactNode;
  searchParams: { topic?: string };
}) {
  const topics = await getAllTopics();

  return (
    <NuqsAdapter>
      <SideMenu title="Topics" isInner className="hidden lg:flex">
        <Suspense fallback={<div>Loading...</div>}>
          <TopicFilter topics={topics} currentTopic={searchParams.topic} />
        </Suspense>
      </SideMenu>

      <div className="flex-1">{children}</div>
    </NuqsAdapter>
  );
}
```

### 6.2 一覧ページ（`app/books/page.tsx`）

```typescript
// app/books/page.tsx

import { ScrollArea } from "@/components/ui/ScrollArea";
import { FloatingHeader } from "@/components/layouts/FloatingHeader";
import { ReadingNoteListView } from "@/modules/books/ui/view/ReadingNoteListView";
import { getReadingNotes } from "@/modules/notion/service/api";
import { routes } from "@/lib/routes";
import { Suspense, ErrorBoundary } from "react";

export default function BooksPage({
  searchParams
}: {
  searchParams: { topic?: string };
}) {
  const notesPromise = getReadingNotes({ topic: searchParams.topic });

  return (
    <>
      {/* モバイル */}
      <ScrollArea className="bg-white h-screen overflow-y-auto lg:hidden">
        <FloatingHeader scrollTitle="読書メモ" goBackLink={routes.home()} />
        <ErrorBoundary fallback={<div>エラーが発生しました</div>}>
          <Suspense fallback={<div>読み込み中...</div>}>
            <ReadingNoteListView notesPromise={notesPromise} />
          </Suspense>
        </ErrorBoundary>
      </ScrollArea>

      {/* デスクトップ */}
      <div className="hidden lg:block">
        <ErrorBoundary fallback={<div>エラーが発生しました</div>}>
          <Suspense fallback={<div>読み込み中...</div>}>
            <ReadingNoteListView notesPromise={notesPromise} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}
```

### 6.3 詳細ページ（`app/books/[id]/page.tsx`）

```typescript
// app/books/[id]/page.tsx

import { ScrollArea } from "@/components/ui/ScrollArea";
import { FloatingHeader } from "@/components/layouts/FloatingHeader";
import { ReadingNoteDetailView } from "@/modules/books/ui/view/ReadingNoteDetailView";
import { getReadingNote } from "@/modules/notion/service/api";
import { routes } from "@/lib/routes";
import { Suspense, ErrorBoundary } from "react";
import { notFound } from "next/navigation";

export default async function BookDetailPage({
  params
}: {
  params: { id: string };
}) {
  try {
    const note = await getReadingNote(params.id);

    return (
      <ScrollArea className="bg-white h-screen overflow-y-auto">
        <FloatingHeader
          scrollTitle={note.title}
          goBackLink={routes.books.index()}
        />
        <ErrorBoundary fallback={<div>エラーが発生しました</div>}>
          <Suspense fallback={<div>読み込み中...</div>}>
            <ReadingNoteDetailView note={note} />
          </Suspense>
        </ErrorBoundary>
      </ScrollArea>
    );
  } catch (error) {
    notFound();
  }
}
```

---

## 7. 動作確認

### 7.1 開発サーバーの起動

```bash
npm run dev
```

### 7.2 確認項目

- [ ] `/books`にアクセスして一覧が表示されるか
- [ ] トピックフィルターが動作するか（サイドメニュー）
- [ ] 読書メモをクリックして詳細ページに遷移できるか
- [ ] 詳細ページで本文ブロックが正しくレンダリングされるか
- [ ] モバイル表示で`FloatingHeader`が表示されるか
- [ ] 非公開の読書メモに直接アクセスすると404になるか

### 7.3 型チェックとLint

```bash
# 型チェック
npm run typecheck

# Lint
npm run lint

# フォーマット
npm run format
```

すべて通過することを確認してください。

---

## トラブルシューティング

### 環境変数エラー

```
Error: Invalid environment variables: NOTION_READING_NOTES_DATABASE_ID...
```

→ `.env.local`にデータベースIDが正しく設定されているか確認してください。

### Notion API エラー

```
Error: Notion API request failed
```

→ `NOTION_SECRET`が正しいか、データベースがAPI統合に共有されているか確認してください。

### 読書メモが表示されない

→ Notionで`is_public`がtrueに設定されているか確認してください。

---

## 8. テストの実装と実行

### 8.1 parseReadingNotePageの単体テスト

```typescript
// modules/books/service/__tests__/parser.test.ts

import { describe, it, expect } from 'vitest'
import { parseReadingNotePage } from '../parser'

describe('parseReadingNotePage', () => {
  it('正常なページオブジェクトをパースできる', () => {
    const mockPage = {
      id: 'test-id-123',
      properties: {
        title: {
          type: 'title',
          title: [{ plain_text: 'テスト読書メモ' }]
        },
        topic: {
          type: 'multi_select',
          multi_select: [
            { name: 'プログラミング' },
            { name: '技術書' }
          ]
        },
        created_at: {
          type: 'date',
          date: { start: '2024-01-01' }
        },
        is_public: {
          type: 'checkbox',
          checkbox: true
        }
      }
    }

    const result = parseReadingNotePage(mockPage)

    expect(result).toEqual({
      id: 'test-id-123',
      title: 'テスト読書メモ',
      topics: ['プログラミング', '技術書'],
      createdAt: '2024-01-01',
      isPublic: true
    })
  })

  it('タイトルが空の場合は「無題」を返す', () => {
    const mockPage = {
      id: 'test-id-123',
      properties: {
        title: { type: 'title', title: [] },
        topic: { type: 'multi_select', multi_select: [] },
        created_at: { type: 'date', date: null },
        is_public: { type: 'checkbox', checkbox: true }
      }
    }

    const result = parseReadingNotePage(mockPage)

    expect(result.title).toBe('無題')
  })
})
```

### 8.2 ReadingNoteListItemのコンポーネントテスト

```typescript
// modules/books/ui/view/__tests__/ReadingNoteListItem.test.tsx

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ReadingNoteListItem } from '../ReadingNoteListItem'

describe('ReadingNoteListItem', () => {
  it('タイトルと日付が表示される', () => {
    const note = {
      id: '1',
      title: 'テスト読書メモ',
      topics: ['プログラミング'],
      createdAt: '2024-01-01',
      isPublic: true
    }

    render(<ReadingNoteListItem note={note} />)

    expect(screen.getByText('テスト読書メモ')).toBeInTheDocument()
    expect(screen.getByText('2024/1/1')).toBeInTheDocument()
  })

  it('トピックタグが表示される', () => {
    const note = {
      id: '1',
      title: 'テスト',
      topics: ['プログラミング', '技術書'],
      createdAt: '2024-01-01',
      isPublic: true
    }

    render(<ReadingNoteListItem note={note} />)

    expect(screen.getByText('プログラミング')).toBeInTheDocument()
    expect(screen.getByText('技術書')).toBeInTheDocument()
  })
})
```

### 8.3 useTopicFilterフックのテスト

```typescript
// modules/books/hooks/__tests__/useTopicFilter.test.ts

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useTopicFilter } from '../useTopicFilter'

describe('useTopicFilter', () => {
  it('トピックの設定とクリアができる', () => {
    const { result } = renderHook(() => useTopicFilter())

    expect(result.current.currentTopic).toBeUndefined()

    act(() => {
      result.current.setTopic('プログラミング')
    })

    expect(result.current.currentTopic).toBe('プログラミング')

    act(() => {
      result.current.clearTopic()
    })

    expect(result.current.currentTopic).toBeUndefined()
  })
})
```

### 8.4 テストの実行

```bash
# すべてのテストを実行
npm run test

# ウォッチモードで実行
npm run test -- --watch

# カバレッジレポートを生成
npm run test:coverage
```

**カバレッジ目標**:
- 主要コンポーネント: 80%以上
- データ取得・パース関数: 90%以上
- カスタムフック: 100%

---

## 次のステップ

実装が完了したら、`/speckit.tasks`コマンドで詳細なタスク一覧を生成し、実装を進めてください。
