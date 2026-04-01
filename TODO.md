# Frontend Refactoring TODO List

## 1. 責務の分離とディレクトリ構造の整理 (Feature-Sliced Design)
現在の `src/components/` にすべてのコンポーネントが平置きされている状態から、機能（Feature）ごとにディレクトリを分割し、凝集度を高めます。

- [ ] `src/features/` ディレクトリの作成
- [ ] **Market Replay 機能 (`src/features/market-replay/`)**
  - `components/` : `ReplaySection.tsx`, `ReplaySkeleton.tsx` などを移動
  - `hooks/` : チャート描画ロジックなどのカスタムフックを配置
  - `types/` : `ReplayData`, `Candle`, `HistoricalStats` などの型定義を移動
- [ ] **Session 機能 (`src/features/sessions/`)**
  - `components/` : `SessionFactTimeline`, `LiveStatusBadge` (現在 page.tsx 内にあるものを分離)
  - `types/` : `SessionVolatility` などの型定義を移動
- [ ] **共通 UI (`src/components/ui/`)**
  - `IndicatorSelector.tsx` など、複数機能から呼ばれる可能性のある汎用コンポーネントを整理

## 2. カスタムフックへのロジック抽出 (Custom Hooks)
コンポーネント内にベタ書きされている副作用（`useEffect`）や状態管理ロジックを分離し、コンポーネントを純粋なViewに近づけます。

- [ ] `useReplayChart` フックの作成
  - 現在 `ReplaySection.tsx` 内にある `lightweight-charts` の初期化、データ流し込み、リサイズイベント、マーカー描画のロジック（約60行）をすべてこのフックに抽出する。
- [ ] `useIndicatorSelection` フックの作成 (任意)
  - `IndicatorSelector.tsx` のURLパラメータ操作 (`useRouter`, `useSearchParams`) のロジックを分離。

## 3. 型定義の一元化 (Type Centralization)
現在 `page.tsx` や `ReplaySection.tsx` の上部に直接書かれている `interface` を専用の型定義ファイルに移動し、インポートして使うようにします。

- [ ] `src/types/` または各 `features/*/types/` に型を移動し、重複や散らばりを防ぐ。

## 4. Hono RPC を用いた型共有 (End-to-End Type Safety)
おっしゃる通り、Hono の RPC クライアント (`hc`) を使えばバックエンドの型（Zod OpenAPI スキーマ）をそのままフロントエンドで推論できるため、手動で `interface` を書く必要がなくなります！
- [ ] モノレポ (Bun Workspaces) の設定を有効化し、`apps/backend` を `apps/frontend` からインポートできるようにする。
- [ ] フロントエンドに `@hono/zod-openapi` と `hono/client` を導入し、`hc<AppType>` を用いた型安全な API クライアントを構築する。
- [ ] 既存の生の `fetch()` 呼び出しを Hono RPC クライアントに置き換える。

## 5. RSC (React Server Components) の評価・維持
現在のアーキテクチャは **RSC主軸** で適切に構築されています。
- `page.tsx` が Server Component として直接 `fetch` を行い、データを取得してから Client Components (`IndicatorSelector`, `ReplaySection`) へ Props として渡す設計になっています。（これは Next.js App Router のベストプラクティスに沿っています）
- 今後のリファクタリングでも、この「データフェッチはサーバー側 (RSC)」「インタラクション・描画ロジックはクライアント側 (Client Components)」という境界を崩さないようにします。
- [ ] `page.tsx` 内の巨大な非同期コンポーネント (`AsyncSessionFactTimeline`, `AsyncLiveStatusBadge`) を別ファイルに切り出し、引き続き RSC として動作させる。

---
※このTODOリストは現状の確認用です。問題なければ実際の修正作業に入ります。