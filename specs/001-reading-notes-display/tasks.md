# タスク: 読書メモ表示機能

**入力**: `/specs/001-reading-notes-display/`からの設計ドキュメント
**前提条件**: plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md

**テスト**: Vitest + Testing Library + MSWを使用した単体・コンポーネント・統合テストを実施します。各ユーザーストーリーに対応するテストタスクが含まれています。

**組織**: タスクはユーザーストーリーごとにグループ化され、各ストーリーの独立した実装とテストを可能にします。

## フォーマット: `[ID] [P?] [Story] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（例: US1、US2、US3）
- 説明には正確なファイルパスを含める

## パス規約

- **Next.js App Router**: リポジトリルートに`src/`
- プロジェクト構造: `src/app/`（ページ）、`src/modules/`（ビジネスロジック）、`src/components/`（UI）

---

## フェーズ1: セットアップ（共有インフラストラクチャ）

**目的**: プロジェクトの初期化と環境変数の設定、テスト環境のセットアップ

- [X] T001 環境変数 `NOTION_READING_NOTES_DATABASE_ID` を `.env.local` に追加
- [X] T002 `src/lib/env.ts` に環境変数バリデーションを追加（zodスキーマ）
- [X] T003 `src/lib/routes.ts` に books ルート定義を追加（`books.index(topic?)`, `books.detail(id)`）
- [X] T004 環境変数が正しく読み込まれることを確認（`npm run dev` でエラーがないこと）
- [X] T005 nuqsをインストール（`npm install nuqs`）
- [X] T006 Vitestをインストール（`npm install -D vitest @vitejs/plugin-react jsdom`）
- [X] T007 Testing Libraryをインストール（`npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event`）
- [X] T008 MSW (Mock Service Worker) をインストール（`npm install -D msw`）
- [X] T009 `vitest.config.ts` にVitest設定を作成（jsdom環境、パスエイリアス設定）
- [X] T010 `vitest.setup.ts` にテストセットアップファイルを作成（@testing-library/jest-dom のインポート）

---

## フェーズ2: 基盤（ブロッキング前提条件）

**目的**: すべてのユーザーストーリーを実装する前に完了する必要があるコアインフラストラクチャ

**⚠️ 重要**: このフェーズが完了するまで、ユーザーストーリーの作業を開始できません

- [X] T011 [P] `modules/books/types/index.ts` に型定義を作成（ReadingNote, ReadingNoteForListView）
- [X] T012 [P] `modules/books/service/parser.ts` に `parseReadingNotePage()` 関数を作成
- [X] T013 `modules/books/service/api.ts` に `getReadingNotes(options?)` 関数を追加
- [X] T014 `modules/books/service/api.ts` に `getReadingNote(id)` 関数を追加
- [X] T015 `modules/books/service/api.ts` に `getAllTopics()` 関数を追加
- [X] T016 データ取得関数の動作確認（Notion APIから正しくデータが取得できることを確認）
- [X] T017 `modules/books/service/__tests__/parser.test.ts` に `parseReadingNotePage()` の単体テストを作成

**チェックポイント**: 基盤が整い、ユーザーストーリーの実装を並列で開始可能

---

## フェーズ3: ユーザーストーリー1 - 読書メモ一覧の閲覧 (優先度: P1) 🎯 MVP

**目標**: 公開されている読書メモの一覧を閲覧できるようにする

**独立したテスト**: `/books` にアクセスして、公開読書メモのタイトルと作成日が一覧表示されることを確認。非公開の読書メモは表示されないことを確認。

### ユーザーストーリー1の実装

- [X] T018 [P] [US1] `modules/books/ui/view/ReadingNoteListItem.tsx` にリストアイテムコンポーネントを作成
- [X] T019 [P] [US1] `modules/books/ui/view/ReadingNoteListView.tsx` にリストビューコンポーネントを作成
- [X] T020 [US1] `modules/books/ui/section/ReadingNoteListSection.tsx` にリストセクション（Server Component）を作成
- [X] T021 [US1] `app/books/layout.tsx` にレイアウトを作成（NuqsAdapter + サイドメニュー構造のみ、トピックフィルターは後で追加）
- [X] T022 [US1] `app/books/page.tsx` に一覧ページを作成（デスクトップ・モバイル対応）
- [X] T023 [US1] `/books` にアクセスして公開読書メモが表示されることを確認
- [X] T024 [US1] 非公開読書メモ（is_public=false）が表示されないことを確認
- [X] T025 [US1] 読書メモが作成日降順でソートされていることを確認

### ユーザーストーリー1のテスト

- [X] T026 [P] [US1] `modules/books/ui/view/__tests__/ReadingNoteListItem.test.tsx` にコンポーネントテストを作成
- [X] T027 [P] [US1] `modules/books/ui/view/__tests__/ReadingNoteListView.test.tsx` にコンポーネントテストを作成

**チェックポイント**: この時点で、ユーザーストーリー1は完全に機能し、独立してテスト可能であるべきです

---

## フェーズ4: ユーザーストーリー3 - 読書メモ詳細の閲覧 (優先度: P1)

**目標**: 一覧から選択した読書メモの詳細内容（タイトル、トピック、作成日、本文）を閲覧できるようにする

**独立したテスト**: 読書メモ詳細ページに直接URLでアクセスし、タイトル、トピック、作成日、本文内容が表示されることを確認。非公開読書メモに直接アクセスすると404エラーになることを確認。

**注意**: US3をUS2の前に実装する理由は、詳細ページの方が優先度が高く（P1）、トピックフィルタリング（P2）より先に必要なためです。

### ユーザーストーリー3の実装

- [X] T028 [P] [US3] `modules/books/ui/view/ReadingNoteDetailView.tsx` に詳細ビューコンポーネントを作成
- [X] T029 [P] [US3] `modules/books/ui/view/ReadingNoteDetailHeader.tsx` に詳細ヘッダーコンポーネントを作成
- [X] T030 [US3] `modules/books/ui/section/ReadingNoteDetailSection.tsx` に詳細セクション（Server Component）を作成
- [X] T031 [US3] `app/books/[id]/page.tsx` に詳細ページを作成
- [X] T032 [US3] `/books/[id]` にアクセスして読書メモ詳細が表示されることを確認
- [X] T033 [US3] タイトル、トピック、作成日、本文ブロックが正しく表示されることを確認
- [X] T034 [US3] Notionブロック（段落、見出し、リスト、コード、画像、引用）が適切にレンダリングされることを確認
- [X] T035 [US3] 非公開読書メモに直接URLアクセスすると404エラーになることを確認
- [X] T036 [US3] 一覧ページ（US1）から詳細ページへの遷移が正しく動作することを確認

### ユーザーストーリー3のテスト

- [X] T037 [P] [US3] `modules/books/ui/view/__tests__/ReadingNoteDetailView.test.tsx` にコンポーネントテストを作成
- [X] T038 [P] [US3] `modules/books/ui/view/__tests__/ReadingNoteDetailHeader.test.tsx` にコンポーネントテストを作成

**チェックポイント**: この時点で、ユーザーストーリー1とユーザーストーリー3の両方が独立して機能するべきです

---

## フェーズ5: ユーザーストーリー2 - サイドメニューでのトピックフィルタリング (優先度: P2)

**目標**: サイドメニューに表示されているトピック一覧から特定のトピックを選択して、該当する読書メモのみを表示できるようにする

**独立したテスト**: サイドメニューに"All"と全トピックのリストが表示され、特定のトピックをクリックすると該当する読書メモのみが表示されることを確認。モバイルではFloatingHeaderのメニューボタンからトピック一覧にアクセスできることを確認。

### ユーザーストーリー2の実装

- [X] T039 [P] [US2] `modules/books/hooks/useTopicFilter.ts` にカスタムフックを作成（nuqsを使用）
- [X] T040 [P] [US2] `modules/books/ui/view/TopicFilter.tsx` にトピックフィルターコンポーネントを作成（useTopicFilterを使用）
- [X] T041 [US2] `app/books/layout.tsx` にトピックフィルターを統合（サイドメニューに"All"とトピック一覧を表示）
- [X] T042 [US2] `app/books/page.tsx` でクエリパラメータ `topic` を読み取り、フィルタリング機能を実装
- [X] T043 [US2] サイドメニューに"All"と全トピックのリストが表示されることを確認
- [X] T044 [US2] 特定のトピックをクリックすると該当する読書メモのみが表示されることを確認
- [X] T045 [US2] "All"をクリックするとすべての読書メモが表示されることを確認
- [X] T046 [US2] 選択中のトピックがアクティブ状態（ハイライト）で表示されることを確認
- [X] T047 [US2] 複数のトピックが付与されている読書メモが、いずれかのトピックでフィルタリングした際に結果に含まれることを確認
- [X] T048 [US2] モバイルデバイスでFloatingHeaderのメニューボタンをタップするとトピック一覧が表示されることを確認

### ユーザーストーリー2のテスト

- [X] T049 [P] [US2] `modules/books/hooks/__tests__/useTopicFilter.test.ts` にカスタムフックのテストを作成
- [X] T050 [P] [US2] `modules/books/ui/view/__tests__/TopicFilter.test.tsx` にコンポーネントテストを作成

**チェックポイント**: すべてのユーザーストーリーが独立して機能するようになりました

---

## フェーズ6: 仕上げと横断的関心事

**目的**: 複数のユーザーストーリーに影響する改善とクオリティ保証

- [X] T051 [P] 型チェックを実行（`npm run typecheck`）してエラーがないことを確認
- [X] T052 [P] Biome lintを実行（`npm run lint`）してエラーがないことを確認
- [X] T053 [P] Biomeフォーマットを実行（`npm run format`）してコードを整形
- [X] T054 [P] テストを実行（`npm run test`）してすべてのテストがパスすることを確認
- [X] T055 読書メモが1件も存在しない場合、一覧ページに適切なメッセージが表示されることを確認（エッジケース対応）
- [X] T056 選択したトピックに該当する読書メモが存在しない場合、その旨のメッセージが表示されることを確認（エッジケース対応）
- [X] T057 トピックが設定されていない読書メモも正常に表示されることを確認（エッジケース対応）
- [X] T058 非常に長いタイトルや大量のトピックが設定されている場合でも、UIが崩れないことを確認（エッジケース対応）
- [X] T059 読書メモの本文に画像やコードブロックが含まれている場合でも、適切にレンダリングされることを確認（エッジケース対応）
- [X] T060 デスクトップ（1024px以上）でサイドメニューが固定表示されることを確認
- [X] T061 モバイル（1024px未満）でFloatingHeaderとMobileDrawerが表示されることを確認
- [X] T062 quickstart.mdの手順に従って動作確認を実施
- [X] T063 グローバルサイドメニューに読書メモへのリンクを追加（`components/ui/MenuItem.tsx`のMenuContentを更新）

---

## 依存関係と実行順序

### フェーズの依存関係

- **セットアップ（フェーズ1）**: 依存関係なし - すぐに開始可能
- **基盤（フェーズ2）**: セットアップの完了に依存 - すべてのユーザーストーリーをブロック
- **ユーザーストーリー（フェーズ3-5）**: すべて基盤フェーズの完了に依存
  - US1（一覧閲覧）: 基盤後に開始可能、他のストーリーへの依存関係なし
  - US3（詳細閲覧）: 基盤後に開始可能、US1と並列実装可能だが、US1の一覧からの遷移テストはUS1完了後
  - US2（トピックフィルタリング）: 基盤後に開始可能、US1完了後が推奨（一覧表示にフィルタリングを追加するため）
- **仕上げ（フェーズ6）**: すべてのユーザーストーリーが完了していることに依存

### ユーザーストーリーの依存関係

- **ユーザーストーリー1（P1）**: 基盤（フェーズ2）後に開始可能 - 他のストーリーへの依存関係なし
- **ユーザーストーリー3（P1）**: 基盤（フェーズ2）後に開始可能 - US1と並列可能だが、一覧からの遷移テストはUS1完了後
- **ユーザーストーリー2（P2）**: US1完了後が推奨 - 一覧表示機能に依存

### 各ユーザーストーリー内

- UIコンポーネントは並列実装可能（[P]マーク付き）
- Server Componentはコンポーネント完成後
- ページはServer Component完成後
- テストは実装完了後に並列実行可能

### 並列実行の機会

- **フェーズ1**: T001-T004は順次実行、T006-T010（テストツールインストールとセットアップ）はT005完了後に並列実行可能
- **フェーズ2**: T011（型定義）とT012（パーサー）は並列実行可能。T013-T015（データ取得関数）はT012完了後に並列実行可能
- **フェーズ3**: T018-T019（UIコンポーネント）、T026-T027（テスト）は並列実行可能
- **フェーズ4**: T028-T029（UIコンポーネント）、T037-T038（テスト）は並列実行可能
- **フェーズ5**: T039-T040（フックとコンポーネント）、T049-T050（テスト）は並列実行可能
- **フェーズ6**: T051-T054は並列実行可能

---

## 並列実行の例: ユーザーストーリー1

```bash
# ユーザーストーリー1のUIコンポーネントを一緒に起動:
Task: "modules/books/ui/view/ReadingNoteListItem.tsx にリストアイテムコンポーネントを作成"
Task: "modules/books/ui/view/ReadingNoteListView.tsx にリストビューコンポーネントを作成"

# ユーザーストーリー1のテストを一緒に起動:
Task: "modules/books/ui/view/__tests__/ReadingNoteListItem.test.tsx にコンポーネントテストを作成"
Task: "modules/books/ui/view/__tests__/ReadingNoteListView.test.tsx にコンポーネントテストを作成"
```

## 並列実行の例: ユーザーストーリー3

```bash
# ユーザーストーリー3のUIコンポーネントを一緒に起動:
Task: "modules/books/ui/view/ReadingNoteDetailView.tsx に詳細ビューコンポーネントを作成"
Task: "modules/books/ui/view/ReadingNoteDetailHeader.tsx に詳細ヘッダーコンポーネントを作成"

# ユーザーストーリー3のテストを一緒に起動:
Task: "modules/books/ui/view/__tests__/ReadingNoteDetailView.test.tsx にコンポーネントテストを作成"
Task: "modules/books/ui/view/__tests__/ReadingNoteDetailHeader.test.tsx にコンポーネントテストを作成"
```

## 並列実行の例: 基盤フェーズ

```bash
# 基盤のデータ取得関数を一緒に起動（T012完了後）:
Task: "modules/books/service/api.ts に getReadingNotes(options?) 関数を追加"
Task: "modules/books/service/api.ts に getReadingNote(id) 関数を追加"
Task: "modules/books/service/api.ts に getAllTopics() 関数を追加"
```

---

## 実装戦略

### MVP優先（ユーザーストーリー1のみ）

1. フェーズ1: セットアップを完了
2. フェーズ2: 基盤を完了（重要 - すべてのストーリーをブロック）
3. フェーズ3: ユーザーストーリー1を完了
4. **停止して検証**: ユーザーストーリー1を独立してテスト
5. 準備ができたらデプロイ/デモ

**MVPの価値**: 公開されている読書メモの一覧を閲覧できる最小限の機能

### インクリメンタルデリバリー（推奨）

1. セットアップ + 基盤を完了 → 基盤が整う
2. ユーザーストーリー1を追加 → 独立してテスト → デプロイ/デモ（MVP!）
3. ユーザーストーリー3を追加 → 独立してテスト → デプロイ/デモ（一覧 + 詳細の完全な閲覧機能）
4. ユーザーストーリー2を追加 → 独立してテスト → デプロイ/デモ（トピックフィルタリングで検索性向上）
5. 仕上げフェーズを完了 → 最終検証 → 本番デプロイ

各ストーリーは以前のストーリーを壊すことなく価値を追加します。

### 並列チーム戦略

複数の開発者がいる場合:

1. チームでセットアップ + 基盤を一緒に完了
2. 基盤が完了したら:
   - 開発者A: ユーザーストーリー1（一覧閲覧）
   - 開発者B: ユーザーストーリー3（詳細閲覧） - US1と並列可能
   - 開発者C: US1完了後にユーザーストーリー2（トピックフィルタリング）を開始
3. ストーリーは独立して完了し、統合される

---

## 備考

- [P]タスク = 異なるファイル、依存関係なし
- [Story]ラベルは、トレーサビリティのためにタスクを特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了およびテスト可能であるべき
- 各タスクまたは論理グループの後にコミット
- 任意のチェックポイントで停止してストーリーを独立して検証
- 避けるべきこと: 曖昧なタスク、同じファイルの競合、独立性を壊すストーリー間の依存関係
- 実装の詳細は `quickstart.md` を参照
- データモデルの詳細は `data-model.md` を参照
- API契約の詳細は `contracts/api-contract.md` を参照
- 技術的な決定事項は `research.md` を参照

---

## タスク統計

- **総タスク数**: 63
- **セットアップタスク**: 10（環境変数4 + テストツール6）
- **基盤タスク**: 7（データ取得・パース6 + テスト1）
- **ユーザーストーリー1タスク**: 10（実装8 + テスト2）
- **ユーザーストーリー3タスク**: 11（実装9 + テスト2）
- **ユーザーストーリー2タスク**: 12（実装10 + テスト2）
- **仕上げタスク**: 13（品質チェック4 + エッジケース対応9）
- **並列実行可能タスク**: 18（[P]マーク付き）
- **テスト関連タスク**: 14（セットアップ6 + 単体テスト1 + コンポーネントテスト6 + フックテスト1）

**推奨MVPスコープ**: フェーズ1（セットアップ）+ フェーズ2（基盤）+ フェーズ3（US1: 一覧閲覧）= 27タスク

**完全な機能**: 全フェーズ完了 = 63タスク

**想定実装時間**:
- MVP（US1のみ、テスト含む）: 3-4時間
- 完全な機能（US1+US2+US3、テスト含む）: 6-8時間
