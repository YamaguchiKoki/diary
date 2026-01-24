# リファクタリング計画

## エグゼクティブサマリー

本コードベースは全体的に良好な構造を持っており、Next.js 16とReact 19の新機能（"use cache"ディレクティブ、`use`フック）を適切に活用しています。モジュール分割も機能ベースで整理されており、保守性が高い設計となっています。

しかし、以下の主要な改善点が特定されました：

1. **高優先度**: next/imageの設定不足、スケルトンUIの品質、エラーハンドリングの一貫性
2. **中優先度**: Client/Server Componentの最適化、不要な再レンダリング防止、型安全性の向上
3. **低優先度**: コード重複の削減、アクセシビリティの改善、テスト可能性の向上

---

## 詳細分析

### 1. 高優先度（即座に対応すべき）

#### 1.1 next/image の width/height 未設定

**ファイル**: `/src/modules/notion/ui/view/BlockRenderer.tsx` (L33-46)

**問題点**:
```tsx
<Image
  src={block.url}
  alt={block.caption ?? ""}
  className="max-w-full"
/>
```
`next/image`コンポーネントで`width`と`height`が指定されていません。これはビルド時エラーまたはレイアウトシフトの原因となります。

**推奨される修正**:
```tsx
<Image
  src={block.url}
  alt={block.caption ?? ""}
  width={800}
  height={600}
  className="max-w-full h-auto"
  sizes="(max-width: 768px) 100vw, 800px"
/>
```
または、外部画像のサイズが不明な場合は `fill` プロパティと親要素の相対位置指定を使用。

**影響範囲**: 投稿詳細ページの画像表示

---

#### 1.2 スケルトンUIの品質が低い

**ファイル**:
- `/src/modules/posts/ui/view/post-detail.tsx` (L36-38)
- `/src/modules/posts/ui/view/post-list.tsx` (L36-38)

**問題点**:
```tsx
export const PostDetailViewSkelton = () => {
  return <p>loading</p>;
};

export const PostListViewSkelton: FC = () => {
  return <div>Skelton</div>;
};
```
スケルトンUIが単純なテキストのみで、UXが悪くなります。また、typoがあります（Skelton -> Skeleton）。

**推奨される修正**:
実際のコンテンツ構造に近いスケルトンUIを実装する。`MenuSkeleton`（MenuItem.tsx）を参考に、アニメーション付きのスケルトンを作成。

**影響範囲**: 投稿一覧・詳細ページの初期読み込み体験

---

#### 1.3 getPost の重複呼び出し

**ファイル**: `/src/app/posts/[year]/[id]/page.tsx` (L30-46)

**問題点**:
```tsx
export default async function PostPage({ params }: Props) {
  const { year, id } = await params;
  const postPromise = getPost(id);  // ここで呼び出し

  return (
    <ScrollArea>
      <PostDetailHeader postPromise={postPromise} ... />  // postPromise を渡す
      <PostDetailSection postId={id} />  // ここで再度 getPost(id) を呼び出し
    </ScrollArea>
  );
}
```
`PostDetailSection`内で再度`getPost(id)`が呼び出されています。キャッシュで対応されていますが、設計として一貫性がありません。

**推奨される修正**:
1つの`postPromise`を共有するか、またはコンポーネント構造を見直して1箇所でのみデータ取得を行う。

**影響範囲**: 投稿詳細ページのデータフローとパフォーマンス

---

#### 1.4 年の範囲がハードコード

**ファイル**: `/src/lib/utils.ts` (L8-9)

**問題点**:
```tsx
const START_YEAR = 2025;
const CURRENT_YEAR = 2026;
```
現在年がハードコードされており、年が変わるたびに手動更新が必要です。

**推奨される修正**:
```tsx
const START_YEAR = 2025;
const CURRENT_YEAR = new Date().getFullYear();
```

**影響範囲**: 年別アーカイブの自動更新

---

### 2. 中優先度（計画的に対応）

#### 2.1 SideMenuの不要な"use client"

**ファイル**: `/src/components/ui/SideMenu.tsx`

**問題点**:
`SideMenu`コンポーネントは`useMemo`を使用していますが、実際にはクライアントサイドの状態やイベントハンドラを持っていません。`useMemo`自体は、このコンポーネントの子コンポーネント（`title`, `children`）が変更されない限り不要です。

**推奨される修正**:
Server Componentとして書き換え可能か検討。クライアントロジックが不要であれば`"use client"`を削除。

**影響範囲**: バンドルサイズの削減

---

#### 2.2 FloatingHeader の複雑なスクロール計算

**ファイル**: `/src/components/ui/FloatingHeader.tsx` (L44-78)

**問題点**:
```tsx
const onScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const scrollY = target.scrollTop;
  const translateY = Math.max(100 - scrollY, 0);
  const opacity = Math.min(
    Math.max(
      Number(
        (
          (scrollY -
            MOBILE_SCROLL_THRESHOLD *
              (MOBILE_SCROLL_THRESHOLD / (scrollY ** 2 / 100))) /
          100
        ).toFixed(2),
      ),
      0,
    ),
    1,
  );
  setTransformValues({ translateY, opacity });
};
```
- スクロールイベントリスナーが2回登録されている（L70-76）
- 複雑な計算ロジックがコンポーネント内にインライン化
- `passive: true`が片方のみに設定

**推奨される修正**:
- スクロールハンドラをカスタムフックに抽出
- `requestAnimationFrame`でスロットリング
- イベントリスナーの重複登録を修正

**影響範囲**: モバイルでのスクロールパフォーマンス

---

#### 2.3 PostListItem の不要なLazyMotion

**ファイル**: `/src/modules/posts/ui/view/post-list-item.tsx`

**問題点**:
```tsx
<LazyMotion features={domAnimation}>
  <Link ...>
    ...
    <m.span key={`${post.id}-views-loading`} />  // 空のm.span
  </Link>
</LazyMotion>
```
`LazyMotion`と`m.span`が使用されていますが、実際のアニメーションは適用されていません。

**推奨される修正**:
不要なmotion関連のimportとコンポーネントを削除するか、意図したアニメーションを実装。

**影響範囲**: バンドルサイズ削減（framer-motion/motion）

---

#### 2.4 books ページが未完成

**ファイル**: `/src/app/books/page.tsx`

**問題点**:
```tsx
export default async function Home() {
  return (
    <ScrollArea className="lg:hidden">
      <p></p>
    </ScrollArea>
  );
}
```
空のページが存在し、`lg:hidden`で大画面では非表示になっています。

**推奨される修正**:
- ページを完成させるか、一時的にルーティングから除外
- または「準備中」ページを表示

**影響範囲**: ユーザー体験（空のページへのナビゲーション）

---

#### 2.5 型の重複定義

**ファイル**:
- `/src/modules/notion/types/index.ts` - `Post`型
- `/src/modules/posts/types/index.ts` - `PostForListView`型

**問題点**:
`Post`型は`notion`モジュールで定義されていますが、これは投稿のドメイン型であり、`posts`モジュールで再エクスポートまたは定義すべきです。

**推奨される修正**:
- ドメイン型（`Post`）は`posts/types`で定義
- Notion固有の型（`Block`, `RichText`）は`notion/types`に残す
- または共有型ディレクトリ（`@/types`）に配置

**影響範囲**: コードの組織化と保守性

---

#### 2.6 NavigationLink での不要な key プロパティ

**ファイル**: `/src/components/ui/NavigationLink.tsx` (L23, L42)

**問題点**:
```tsx
<a key={href} ...>  // keyは配列のmap内でのみ必要
```
`key`プロパティが単一要素に設定されています。これはmap関数内ではなくコンポーネントに直接設定されているため不要です。

**推奨される修正**:
`key={href}`を削除。

**影響範囲**: コードの明確さ

---

### 3. 低優先度（時間があれば対応）

#### 3.1 RichText コンポーネントのキー生成

**ファイル**: `/src/modules/notion/ui/view/RichText.tsx` (L27)

**問題点**:
```tsx
<span key={`${t.text}-${i}`}>{node}</span>
```
インデックスベースのキーは、リストの並び替えや挿入時にReactの差分検出を妨げる可能性があります。

**推奨される修正**:
Notion APIからのユニークなIDがあればそれを使用。なければ現状維持で許容。

**影響範囲**: リストの再レンダリング効率

---

#### 3.2 BlockRenderer でのキー生成

**ファイル**: `/src/modules/posts/ui/view/post-detail.tsx` (L28)

**問題点**:
```tsx
<BlockRenderer key={`${block.type}-${i}`} block={block} />
```
同上、インデックスベースのキー。

**推奨される修正**:
各ブロックにIDを持たせる（Notion APIからblock.idを保持）。

**影響範囲**: 投稿コンテンツの再レンダリング効率

---

#### 3.3 BentoGrid が未使用

**ファイル**: `/src/components/layouts/BentoGrid.tsx`

**問題点**:
コンポーネントが定義されていますが、コードベース内で使用されていません。

**推奨される修正**:
- 使用予定があれば保持
- なければ`knip`で検出して削除

**影響範囲**: コードベースの整理

---

#### 3.4 LightRays が未使用

**ファイル**: `/src/components/ui/LightRays.tsx`

**問題点**:
同上、未使用のコンポーネント。

**推奨される修正**:
使用されていなければ削除を検討。

**影響範囲**: コードベースの整理、バンドルサイズ

---

#### 3.5 アクセシビリティの改善

**ファイル**: 複数

**問題点**:
- リンクに`aria-label`がない箇所がある
- 画像の`alt`属性が空になる可能性がある
- フォーカス管理が一部不足

**推奨される修正**:
- 適切なaria属性を追加
- 意味のあるalt属性を確保
- キーボードナビゲーションの検証

**影響範囲**: アクセシビリティスコア

---

#### 3.6 テストの不在

**問題点**:
テストファイルが存在しません。

**推奨される修正**:
- Vitest + React Testing Libraryの導入
- クリティカルパス（データ取得、表示）のテスト追加

**影響範囲**: コード品質の保証

---

## 具体的なリファクタリングタスク

### フェーズ1: 緊急修正（1-2日）
- [ ] BlockRenderer.tsxのnext/imageにwidth/heightを追加
- [ ] utils.tsのCURRENT_YEARを動的に取得
- [ ] PostDetailViewSkelton/PostListViewSkeltonを適切なスケルトンUIに改善
- [ ] typo修正: Skelton -> Skeleton

### フェーズ2: パフォーマンス最適化（3-5日）
- [ ] FloatingHeaderのスクロールハンドラを最適化（カスタムフック化、重複登録修正）
- [ ] PostListItemから未使用のLazyMotion/m.spanを削除
- [ ] SideMenuのServer Component化を検討
- [ ] getPost重複呼び出しの解消

### フェーズ3: 構造改善（1週間）
- [ ] 型定義の整理（Post型の適切な配置）
- [ ] books ページの完成または一時削除
- [ ] 未使用コンポーネント（BentoGrid, LightRays）の整理
- [ ] NavigationLinkの不要なkeyプロパティ削除

### フェーズ4: 品質向上（継続的）
- [ ] アクセシビリティ改善（aria属性、alt属性）
- [ ] エラーハンドリングの一貫性確保
- [ ] ユニットテストの追加
- [ ] E2Eテストの追加

---

## 推奨アーキテクチャ改善

### 1. データフェッチングパターンの統一

現在、Promiseをpropsとして渡すパターンと、コンポーネント内でデータフェッチするパターンが混在しています。

**現状**:
```
Page -> postPromise作成 -> Header(postPromise) + Section(postId)
                                                  ↓
                                            内部でpostPromise作成
```

**推奨**:
```
Page -> postPromise作成 -> Header(postPromise) + DetailView(postPromise)
```

Single Source of Truthの原則に従い、データソースを1箇所に統一。

---

### 2. スケルトンUIのコンポーネント化

スケルトンパターンを共通化：

```typescript
// src/components/layouts/Skeleton.tsx
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-gray-100 rounded animate-pulse", className)} />
);

export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={cn("h-4", i === lines - 1 && "w-2/3")} />
    ))}
  </div>
);
```

---

### 3. カスタムフックの導入

スクロール関連のロジックをフックに抽出：

```typescript
// src/hooks/useScrollTransform.ts
export function useScrollTransform(scrollAreaId: string) {
  const [transform, setTransform] = useState({ translateY: 0, opacity: 1 });

  useEffect(() => {
    // スクロールハンドラのロジック
  }, [scrollAreaId]);

  return transform;
}
```

---

### 4. エラー境界の階層化

現在ErrorBoundaryが複数箇所で使用されていますが、エラー表示の一貫性を保つため、App Router の error.tsx との併用を検討：

```
src/
├── app/
│   ├── error.tsx          # グローバルエラーUI
│   ├── posts/
│   │   └── [year]/
│   │       ├── error.tsx  # 投稿関連エラーUI
│   │       └── [id]/
│   │           └── error.tsx
```

---

### 5. 動的インポートの最適化

現在`MobileDrawer`のみが動的インポートされていますが、以下も検討：

- `Highlighter`（rough-notationライブラリ）
- モーダル/ドロワーコンポーネント全般

```typescript
const Highlighter = dynamic(
  () => import("@/components/ui/highlighter").then((mod) => mod.Highlighter),
  { ssr: false }
);
```

---

## まとめ

このコードベースは、Next.js 16とReact 19の新機能を積極的に活用しており、全体的に良い状態です。主な改善ポイントは：

1. **即座の修正**: next/imageの設定、スケルトンUI、ハードコードされた年
2. **中期的改善**: パフォーマンス最適化、不要なClient Component化の削減
3. **長期的改善**: テスト導入、アクセシビリティ、アーキテクチャの一貫性

これらの改善を段階的に実施することで、保守性、パフォーマンス、ユーザー体験が向上します。
