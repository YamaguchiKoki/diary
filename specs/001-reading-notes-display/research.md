# 技術調査: 読書メモ表示機能

**作成日**: 2026-01-24
**フェーズ**: Phase 0 - Outline & Research

## 調査の目的

読書メモ表示機能を実装するために、以下の技術的な不明点を解決し、最適なアプローチを決定します。

## 調査項目

### 1. Notion APIでの読書メモデータ取得パターン

**調査内容**: 既存のpost取得パターンを読書メモに適用する方法

**決定事項**:
- 既存の`modules/notion/service/api.ts`の`getPosts()`および`getPost(id)`パターンを踏襲
- 新規関数: `getReadingNotes()`, `getReadingNote(id)`, `getAllTopics()`を追加
- Notion DatabaseのQuery APIを使用してフィルタリング（`is_public === true`）
- マルチセレクトプロパティ（topic）の取得方法を確認

**実装アプローチ**:
```typescript
// modules/notion/service/api.ts に追加

export async function getReadingNotes() {
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

  return response.results.map(parseReadingNotePage);
}

export async function getReadingNote(id: string) {
  "use cache";
  cacheTag(`reading-note-${id}`);
  cacheLife("days");

  const [page, blocks] = await Promise.all([
    notionClient.pages.retrieve({ page_id: id }),
    notionClient.blocks.children.list({ block_id: id })
  ]);

  // is_publicチェック
  const isPublic = page.properties.is_public?.checkbox ?? false;
  if (!isPublic) {
    throw new Error("Not found");
  }

  return {
    ...parseReadingNotePage(page),
    blocks: blocks.results.map(parseBlock)
  };
}

export async function getAllTopics() {
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

  // 全読書メモからトピックを抽出してユニーク化
  const topicsSet = new Set<string>();
  for (const page of response.results) {
    const topics = page.properties.topic?.multi_select ?? [];
    for (const topic of topics) {
      topicsSet.add(topic.name);
    }
  }

  return Array.from(topicsSet).sort((a, b) => a.localeCompare(b, 'ja'));
}
```

**選択理由**:
- 既存のパターンとの一貫性を保つことで、保守性とコードの可読性が向上
- "use cache"ディレクティブにより、Notion APIのレート制限対策とパフォーマンス向上を両立
- トピック一覧を動的に取得することで、Notionでトピックを追加・削除した際に自動反映

**代替案**:
- GraphQL API: Notionは現在REST APIのみサポートしているため却下
- トピックのハードコード: 動的取得の方が柔軟性が高いため却下

---

### 2. Notionマルチセレクトプロパティのパース方法

**調査内容**: Notion APIの`multi_select`プロパティを型安全にパースする方法

**決定事項**:
- Notion APIの `multi_select` プロパティは `{ name: string, id: string, color: string }[]` の形式
- パーサー関数で`string[]`に変換（UIでは名前のみ使用）

**実装アプローチ**:
```typescript
// modules/books/service/parser.ts（新規作成）

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { ReadingNote, ReadingNoteForListView } from "../types";

export function parseReadingNotePage(page: PageObjectResponse): ReadingNoteForListView {
  const properties = page.properties;

  // titleプロパティの取得
  const titleProp = properties.title;
  const title = titleProp?.type === "title"
    ? titleProp.title.map(t => t.plain_text).join("")
    : "無題";

  // topicプロパティの取得（マルチセレクト）
  const topicProp = properties.topic;
  const topics = topicProp?.type === "multi_select"
    ? topicProp.multi_select.map(t => t.name)
    : [];

  // created_atプロパティの取得
  const createdAtProp = properties.created_at;
  const createdAt = createdAtProp?.type === "date"
    ? createdAtProp.date?.start ?? null
    : null;

  // is_publicプロパティの取得
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

**選択理由**:
- 型安全性を保ちつつ、UIで必要な情報（トピック名のみ）に絞ることで、データモデルをシンプルに保つ
- 既存の`modules/notion/service/parser.ts`のパターンを踏襲

**代替案**:
- トピックの色情報も保持: UIで色を使う予定がないため却下
- トピックIDも保持: 名前のみで十分であるため却下

---

### 3. トピックフィルタリングのURL設計とクエリパラメータ管理

**調査内容**: トピックフィルタリングをURLパラメータで実現する方法、およびクエリパラメータ管理ライブラリの選定

**決定事項**:
- クエリパラメータ`topic`を使用: `/books?topic=プログラミング`
- トピックが指定されていない場合: `/books` （全読書メモ表示）
- **nuqsライブラリを使用**してクエリパラメータを型安全に管理
- `routes.ts`に型安全なURL生成関数を追加

**nuqsの選定理由**:
- Next.js App Routerに最適化されたクエリパラメータ管理ライブラリ
- 型安全なパーサー機能（zodと統合可能）
- URLとステートの自動同期
- Server ComponentとClient Componentの両方で使用可能
- ブラウザ履歴の適切な管理（戻る/進むボタン対応）

**実装アプローチ**:

**1. nuqsのセットアップ**:
```typescript
// app/books/layout.tsx にNuqsAdapterを追加
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function BooksLayout({ children }) {
  return <NuqsAdapter>{children}</NuqsAdapter>
}
```

**2. クエリパラメータパーサーの定義**:
```typescript
// modules/books/hooks/useTopicFilter.ts （新規作成）
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

**3. routes.tsの型安全なURL生成**:
```typescript
// src/lib/routes.ts に追加

export const routes = {
  // 既存のルート...
  books: {
    index: (topic?: string) => {
      const base = "/books";
      return topic ? `${base}?topic=${encodeURIComponent(topic)}` : base;
    },
    detail: (id: string) => `/books/${id}`
  }
} as const;
```

**使用例**:
```typescript
// Client Componentでの使用
"use client"
import { useTopicFilter } from "@/modules/books/hooks/useTopicFilter"

export function TopicFilter({ topics }: { topics: string[] }) {
  const { currentTopic, setTopic, clearTopic } = useTopicFilter()

  return (
    <div>
      <button onClick={() => clearTopic()}>All</button>
      {topics.map(topic => (
        <button
          key={topic}
          onClick={() => setTopic(topic)}
          className={currentTopic === topic ? 'active' : ''}
        >
          {topic}
        </button>
      ))}
    </div>
  )
}
```

**選択理由**:
- **nuqs使用**: 型安全性、Next.js App Router最適化、URLとステートの自動同期により、手動でのクエリパラメータ管理より堅牢
- クエリパラメータを使うことで、ブラウザの戻る/進むボタンで履歴を辿れる
- URLを共有することで、特定のトピックでフィルタリングされた状態を共有可能
- カスタムフックでロジックをカプセル化し、再利用性を向上

**代替案**:
- Next.jsの`useSearchParams()`のみ使用: 型安全性が低く、手動でのURL更新が必要なため却下
- クライアントステートのみで管理: URLに状態が反映されず、共有性が低いため却下
- `/books/topic/プログラミング`のような動的ルート: クエリパラメータの方がシンプルで、複数フィルター追加時に拡張しやすいため却下
- zustand/jotaiなどのステート管理: URLとの同期が手動になり、nuqsの方がシンプルなため却下

---

### 4. サイドメニューのトピック一覧表示とアクティブ状態管理

**調査内容**: 既存の`SideMenu`コンポーネントを再利用してトピック一覧を表示する方法

**決定事項**:
- `components/ui/SideMenu.tsx`を再利用
- `NavigationLink`コンポーネント（`components/ui/MenuItem.tsx`）でアクティブ状態を自動検出
- トピック一覧は`TopicFilter`コンポーネントとして実装

**実装アプローチ**:
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

**レイアウト構造**:
```typescript
// app/books/layout.tsx

import { SideMenu } from "@/components/ui/SideMenu";
import { TopicFilter } from "@/modules/books/ui/view/TopicFilter";
import { getAllTopics } from "@/modules/notion/service/api";
import { Suspense } from "react";

export default async function BooksLayout({ children }: { children: React.ReactNode }) {
  const topics = await getAllTopics();

  return (
    <>
      {/* デスクトップ: サイドメニュー */}
      <SideMenu title="Topics" isInner>
        <Suspense fallback={<div>Loading...</div>}>
          <TopicFilter topics={topics} />
        </Suspense>
      </SideMenu>

      {/* メインコンテンツ */}
      <div className="flex-1">
        {children}
      </div>
    </>
  );
}
```

**選択理由**:
- 既存の`SideMenu`と`NavigationLink`を再利用することで、postページとの一貫性を保つ
- `NavigationLink`のアクティブ状態検出機能を活用し、実装を簡潔に保つ
- Server Componentでトピック一覧を取得し、キャッシュを活用

**代替案**:
- カスタムサイドメニューの実装: 既存コンポーネントを再利用する方が効率的で、UI一貫性も保てるため却下
- トピックをクライアント側で取得: Server Componentで取得してキャッシュする方がパフォーマンスが良いため却下

---

### 5. モバイル対応（FloatingHeader + MobileDrawer）

**調査内容**: 既存のモバイル対応パターンを読書メモに適用する方法

**決定事項**:
- `components/layouts/FloatingHeader.tsx`を再利用
- モバイル時は`lg:hidden`で`SideMenu`を非表示
- `MobileDrawer`でトピック一覧を表示（タップで開閉）

**実装アプローチ**:
```typescript
// app/books/page.tsx

import { FloatingHeader } from "@/components/layouts/FloatingHeader";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ReadingNoteListSection } from "@/modules/books/ui/section/ReadingNoteListSection";

export default function BooksPage({ searchParams }: { searchParams: { topic?: string } }) {
  const currentTopic = searchParams.topic;

  return (
    <>
      {/* モバイル: FloatingHeader */}
      <ScrollArea className="bg-white h-screen overflow-y-auto lg:hidden">
        <FloatingHeader scrollTitle="読書メモ" goBackLink={routes.home()} />
        <ReadingNoteListSection topic={currentTopic} isMobile />
      </ScrollArea>

      {/* デスクトップ: 通常表示 */}
      <div className="hidden lg:block">
        <ReadingNoteListSection topic={currentTopic} />
      </div>
    </>
  );
}
```

**選択理由**:
- 既存のpostページのモバイル対応パターンを完全に踏襲
- `lg`ブレークポイント（1024px）でデスクトップ/モバイルを切り替え
- FloatingHeaderのスティッキー動作により、スクロール中も操作しやすい

**代替案**:
- カスタムモバイルヘッダーの実装: 既存パターンを再利用する方が一貫性とメンテナンス性が高いため却下
- レスポンシブグリッドのみで対応: サイドメニューの表示/非表示切り替えがよりユーザーフレンドリーであるため却下

---

### 6. 環境変数の追加とバリデーション

**調査内容**: 読書メモ用のNotion Database IDを環境変数として追加する方法

**決定事項**:
- 環境変数名: `NOTION_READING_NOTES_DATABASE_ID`
- `src/lib/env.ts`にzodスキーマを追加してバリデーション

**実装アプローチ**:
```typescript
// src/lib/env.ts

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NOTION_SECRET: z.string().min(1),
    NOTION_DATABASE_ID: z.string().length(32),
    NOTION_DATA_SOURCE_ID: z.string().uuid(),
    // 新規追加
    NOTION_READING_NOTES_DATABASE_ID: z.string().length(32).describe("Notion reading notes database ID")
  },
  runtimeEnv: {
    NOTION_SECRET: process.env.NOTION_SECRET,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_DATA_SOURCE_ID: process.env.NOTION_DATA_SOURCE_ID,
    NOTION_READING_NOTES_DATABASE_ID: process.env.NOTION_READING_NOTES_DATABASE_ID
  }
});
```

**.env.local に追加**:
```
NOTION_READING_NOTES_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**選択理由**:
- 既存の環境変数管理パターンを踏襲
- zodによる実行時バリデーションで、環境変数の不備を早期検出
- NotionのDatabase IDは32文字固定なので、厳密なバリデーションを実施

**代替案**:
- 既存の`NOTION_DATABASE_ID`を読書メモとpostで共用: 分離した方が柔軟性が高く、誤操作のリスクも低いため却下
- バリデーションなしで環境変数を使用: 型安全性と実行時エラー防止のため却下

---

---

### 7. テスト戦略

**調査内容**: 読書メモ機能のテスト方針とテストツールの選定

**決定事項**:
- **フロントエンドテスト**: Vitestを使用
- **UIコンポーネントテスト**: Testing Library（React Testing Library）を使用
- **E2Eテスト**: Playwrightを使用（将来的に追加可能）
- テスト対象: データ取得関数、UIコンポーネント、ユーザーフロー

**テスト範囲**:

1. **単体テスト（Unit Tests）**:
   - データパース関数（`parseReadingNotePage`）
   - カスタムフック（`useTopicFilter`）
   - ユーティリティ関数

2. **コンポーネントテスト（Component Tests）**:
   - `ReadingNoteListItem`: タイトル、日付、トピックタグの表示
   - `ReadingNoteListView`: 空状態、データあり状態
   - `TopicFilter`: トピック選択、アクティブ状態
   - `ReadingNoteDetailView`: 詳細情報の表示

3. **統合テスト（Integration Tests）**:
   - ページレベルのレンダリング
   - トピックフィルタリングのフロー
   - 一覧→詳細の遷移

**ツール選定理由**:

| ツール | 用途 | 選定理由 |
|--------|------|---------|
| **Vitest** | テストランナー | Vite互換、高速、TypeScript完全対応 |
| **Testing Library** | UIテスト | ユーザー視点のテスト、React 19対応 |
| **MSW (Mock Service Worker)** | API モック | Notion APIのモック、ネットワークレイヤーでのインターセプト |

**実装アプローチ**:

**1. Vitestセットアップ**:
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

**2. テストの例**:
```typescript
// modules/books/ui/view/__tests__/ReadingNoteListItem.test.tsx
import { render, screen } from '@testing/library/react'
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
    expect(screen.getByText('2024/01/01')).toBeInTheDocument()
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

**3. カスタムフックのテスト**:
```typescript
// modules/books/hooks/__tests__/useTopicFilter.test.ts
import { renderHook, act } from '@testing-library/react'
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

**選択理由**:
- Vitestは既存プロジェクトにすでにViteがある場合に最適
- Testing Libraryはユーザー視点のテストを推奨しており、実際の使用パターンに近いテストが書ける
- MSWはNotion APIのモックに最適で、実際のネットワークリクエストと同じ方法でテスト可能

**代替案**:
- Jest: Vitestの方が高速で、設定がシンプルなため却下
- Cypress: Playwrightの方がNext.js 16との互換性が高く、並列実行が高速なため却下
- 手動テストのみ: 回帰テストの自動化がなく、リファクタリング時の安全性が低いため却下

**テストカバレッジ目標**:
- 主要コンポーネント: 80%以上
- データ取得・パース関数: 90%以上
- カスタムフック: 100%

---

## 調査結果のサマリー

| 項目 | 決定事項 | 根拠 |
|------|---------|------|
| データ取得 | `getReadingNotes()`, `getReadingNote(id)`, `getAllTopics()`を追加 | 既存のpost取得パターンを踏襲、一貫性を保つ |
| マルチセレクトパース | トピック名の配列（`string[]`）に変換 | UIで必要な情報に絞り、シンプルに保つ |
| URL設計 | `/books?topic=xxx`のクエリパラメータ方式 + **nuqs**で管理 | 型安全性、URL同期、共有可能性、履歴対応 |
| クエリパラメータ管理 | **nuqs**ライブラリを使用 | App Router最適化、型安全、自動同期 |
| サイドメニュー | `SideMenu` + `NavigationLink`を再利用 | 既存UI一貫性、実装効率 |
| モバイル対応 | `FloatingHeader` + `MobileDrawer`を再利用 | 既存パターン踏襲、ユーザー体験の一貫性 |
| 環境変数 | `NOTION_READING_NOTES_DATABASE_ID`を追加 | 分離管理、zodバリデーション |
| テスト | **Vitest + Testing Library + MSW** | 高速、型安全、ユーザー視点のテスト |

すべての調査項目について、既存パターンの踏襲と型安全性の確保を最優先に決定しました。これにより、保守性の高い実装が可能となります。
