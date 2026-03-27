# 実装計画: 読書メモ表示機能

**ブランチ**: `001-reading-notes-display` | **作成日**: 2026-01-24 | **仕様**: [spec.md](./spec.md)
**入力**: `/specs/001-reading-notes-display/spec.md`からの機能仕様

**注意**: このテンプレートは`/speckit.plan`コマンドによって入力されます。実行ワークフローについては、`.specify/templates/commands/plan.md`を参照してください。

## 概要

Notionデータベースから読書メモ（title, topic, is_public, created_at, 本文ブロック）を取得し、既存のpost機能と同様のUIパターン（サイドメニュー + メインコンテンツ）で表示する機能を実装します。

**主要要件**:
1. 読書メモの一覧・詳細表示（公開フラグに基づくアクセス制御）
2. サイドメニューによるトピックフィルタリング
3. デスクトップ/モバイル対応のレスポンシブUI
4. Notionブロックの適切なレンダリング
5. 既存のUIコンポーネント（SideMenu, NavigationLink, ScrollArea等）の再利用

**技術的アプローチ**:
- 既存の`modules/notion/`のAPI連携・パース機能を活用
- 新規モジュール`modules/books/`を作成（reading notesの略称として`books`を使用）
- `/books`と`/books/[id]`のルートを追加
- 環境変数に読書メモ用データベースIDを追加

## 技術コンテキスト

**言語/バージョン**: TypeScript 5.9.3, React 19.2.0, Next.js 16.1.0 (App Router)
**主要な依存関係**:
- @notionhq/client 5.4.0 (Notion API)
- @t3-oss/env-nextjs 0.13.8 (環境変数バリデーション)
- zod 4.1.13 (型バリデーション)
- Tailwind CSS 4 (スタイリング)
- Biome 2.2.0 (Linting/Formatting)
- nuqs (クエリパラメータ管理)
- vitest (テストランナー)
- @testing-library/react (UIコンポーネントテスト)
- @testing-library/user-event (ユーザーインタラクションテスト)
- msw (API モック)

**ストレージ**: Notion API (外部データソース、REST API経由でアクセス)
**テスト**: Vitest + Testing Library + MSW（単体・コンポーネント・統合テスト）、Biome lint + TypeScript型チェック
**ターゲットプラットフォーム**: Web（デスクトップ・モバイルブラウザ）
**プロジェクトタイプ**: Next.js SSR/SSG Webアプリケーション
**パフォーマンス目標**:
- 一覧ページ初期表示: 3秒以内
- 詳細ページ遷移: 2秒以内
- 50件以上の読書メモでも5秒以内に初期表示

**制約**:
- Notion API レート制限対策（キャッシュ必須）
- 日本語フォント対応必須
- 既存のpost機能UIとの一貫性維持

**規模/スコープ**:
- 新規ページ: 2ページ（一覧・詳細）
- 新規モジュール: 1つ（modules/books/）
- 再利用コンポーネント: 10個以上
- 新規作成コンポーネント: 約5-8個
- テストファイル: 約10-15個（コンポーネントテスト、フック、データ関数）

## 憲章チェック

*ゲート: フェーズ0のリサーチ前に通過する必要があります。フェーズ1の設計後に再チェック。*

### 原則 I: Module-Based Architecture ✅ PASS

- **評価**: 準拠
- **計画**: 新規モジュール `modules/books/` を作成し、以下の構造で実装
  - `modules/books/service/` - データ取得・変換ロジック
  - `modules/books/types/` - 型定義
  - `modules/books/ui/` - 読書メモ表示用コンポーネント
- `app/books/` にはページ定義のみを配置し、ビジネスロジックは `modules/books/` に集約

### 原則 II: Type Safety First ✅ PASS

- **評価**: 準拠
- **計画**:
  - Notion APIレスポンスはzodスキーマまたは型ガードでパース
  - 新しい環境変数（`NOTION_READING_NOTES_DATABASE_ID`）は `env.ts` でバリデーション
  - ルート追加は `src/lib/routes.ts` で型安全に定義（`routes.books()`, `routes.books.detail(id)`）
  - すべての読書メモ関連の型を `modules/books/types/` で明示的に定義

### 原則 III: Caching Strategy ✅ PASS

- **評価**: 準拠
- **計画**:
  - `getReadingNotes()`: "use cache"ディレクティブで時間単位キャッシュ、タグ: `reading-notes-all`
  - `getReadingNote(id)`: "use cache"で日単位キャッシュ、タグ: `reading-note-${id}`
  - `getTopics()`: トピック一覧も時間単位キャッシュ、タグ: `reading-notes-topics`
  - 既存のpost機能のキャッシュパターンを踏襲

### 原則 IV: Biome Tooling Compliance ✅ PASS

- **評価**: 準拠
- **計画**:
  - すべての新規コードは `npm run format` でフォーマット
  - `npm run lint` でエラーがないことを確認
  - Git hookにより自動的にチェック実施

### 原則 V: Japanese-First Content ✅ PASS

- **評価**: 準拠
- **計画**:
  - 既存のNoto Sans JP フォント設定を継承
  - UIテキストはすべて日本語
  - 読書メモのタイトル・本文は日本語コンテンツを想定

### 原則 VI: Notion Block Extensibility ✅ PASS

- **評価**: 準拠
- **計画**:
  - 既存の `modules/notion/service/parser.ts` と `BlockRenderer.tsx` を再利用
  - 新しいブロックタイプのサポートは両ファイルを同時に更新
  - 読書メモ特有のブロックタイプがある場合は適切に拡張

### 原則 VII: Git Hooks Enforcement ✅ PASS

- **評価**: 準拠
- **計画**: Lefthookによる pre-commit/pre-push チェックに準拠

**結論**: すべての憲章原則に準拠。ゲートを通過し、Phase 0に進みます。

## プロジェクト構造

### ドキュメント（この機能）

```text
specs/001-reading-notes-display/
├── spec.md              # 機能仕様
├── plan.md              # このファイル（/speckit.planコマンド出力）
├── research.md          # フェーズ0の出力（/speckit.planコマンド）
├── data-model.md        # フェーズ1の出力（/speckit.planコマンド）
├── quickstart.md        # フェーズ1の出力（/speckit.planコマンド）
├── contracts/           # フェーズ1の出力（/speckit.planコマンド）
├── checklists/          # 品質チェックリスト
│   └── requirements.md
└── tasks.md             # フェーズ2の出力（/speckit.tasksコマンド）
```

### ソースコード（リポジトリルート）

このプロジェクトはNext.js App Routerを使用した単一のWebアプリケーションです。

```text
src/
├── app/                         # Next.js App Router（ページ定義のみ）
│   └── books/                   # 読書メモページ（新規作成）
│       ├── layout.tsx           # レイアウト（NuqsAdapter + サイドメニュー + メインコンテンツ）
│       ├── page.tsx             # 一覧ページ
│       └── [id]/
│           └── page.tsx         # 詳細ページ
│
├── modules/                     # ドメインモジュール
│   ├── books/                   # 読書メモモジュール（新規作成）
│   │   ├── service/
│   │   │   ├── api.ts           # Notion APIからデータ取得
│   │   │   └── parser.ts        # Notionデータのパース
│   │   ├── hooks/
│   │   │   └── useTopicFilter.ts        # nuqsを使ったトピックフィルター管理
│   │   ├── types/
│   │   │   └── index.ts         # 読書メモの型定義
│   │   └── ui/
│   │       ├── view/
│   │       │   ├── ReadingNoteListView.tsx      # 一覧表示
│   │       │   ├── ReadingNoteListItem.tsx      # 一覧アイテム
│   │       │   ├── ReadingNoteDetailView.tsx    # 詳細表示
│   │       │   ├── ReadingNoteDetailHeader.tsx  # 詳細ヘッダー
│   │       │   ├── TopicFilter.tsx              # トピックフィルター
│   │       │   └── __tests__/           # コンポーネントテスト
│   │       └── section/
│   │           ├── ReadingNoteListSection.tsx   # 一覧セクション（Server Component）
│   │           └── ReadingNoteDetailSection.tsx # 詳細セクション（Server Component）
│   │
│   └── notion/                  # Notion統合（既存・再利用）
│       ├── client.ts
│       ├── service/
│       │   ├── api.ts           # 拡張: getReadingNotes(), getReadingNote()
│       │   └── parser.ts        # 既存パーサーを再利用
│       ├── types/
│       └── ui/
│           └── view/
│               └── BlockRenderer.tsx  # 既存のブロックレンダラーを再利用
│
├── components/                  # 汎用UIコンポーネント（既存・再利用）
│   ├── ui/
│   │   ├── SideMenu.tsx         # サイドメニュー
│   │   ├── MenuItem.tsx         # NavigationLink
│   │   ├── ScrollArea.tsx       # スクロールエリア
│   │   ├── PageTitle.tsx        # ページタイトル
│   │   └── ErrorBoundary.tsx    # エラーバウンダリ
│   └── layouts/
│       └── FloatingHeader.tsx   # モバイルヘッダー
│
└── lib/
    ├── routes.ts                # ルート定義（拡張: books()追加）
    ├── env.ts                   # 環境変数（拡張: NOTION_READING_NOTES_DATABASE_ID追加）
    └── utils.ts                 # ユーティリティ
```

**構造の決定**:
- Next.js App Routerの単一プロジェクト構造を採用
- 新規モジュール `modules/books/` を作成し、読書メモ機能のビジネスロジックを集約
- `app/books/` にはページ定義のみを配置（憲章原則Iに準拠）
- 既存の `modules/notion/` の機能を拡張・再利用
- 既存の `components/` の汎用UIコンポーネントを最大限活用

## 複雑性トラッキング

> **憲章チェックに正当化が必要な違反がある場合のみ記入**

該当なし。すべての憲章原則に準拠しています。
