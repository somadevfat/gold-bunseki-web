# フロントエンド アーキテクチャ (Next.js)

## 1. 概要
- **フレームワーク**: Next.js (App Router)
- **スタイリング**: Tailwind CSS
- **パッケージマネージャー**: Bun
- **ディレクトリ構成**: Next.js公式推奨の `src/` ディレクトリを採用

## 2. 基本ディレクトリツリー

```text
apps/web/
├── src/
│   ├── app/                 # 📂 Next.js App Router (URLルーティングとページ)
│   │   ├── layout.tsx       # 全画面共通のレイアウト (ヘッダー・フッター等)
│   │   ├── page.tsx         # トップページ (/)
│   │   ├── globals.css      # Tailwind初期化とグローバルCSS
│   │   └── (routes)/        # URLごとのページディレクトリ
│   │
│   ├── components/          # 🧩 再利用可能なReactコンポーネント
│   │   ├── ui/              # 見た目だけを持つ汎用パーツ (ボタン、カード、チャート)
│   │   └── layouts/         # 汎用的な配置用コンポーネント (サイドバー等)
│   │
│   ├── lib/                 # 🛠️ アプリ全体で使う裏方ロジック
│   │   ├── api/             # GoバックエンドAPI (/api/v1/...) を叩くクライアント
│   │   ├── types/           # 共通のTypeScript型定義 (User, PriceRecord等)
│   │   └── utils.ts         # 共通関数 (日付フォーマットなど)
│   │
│   └── hooks/               # 🎣 カスタムフック (状態管理やデータフェッチのラップ)
│
├── public/                  # 静的ファイル (画像、faviconなど)
├── tailwind.config.ts       # Tailwind CSS 詳細設定
├── next.config.ts           # Next.js サーバー設定
└── package.json             # 依存パッケージ (Bun管理)
```

## 3. 開発ルール

1. **ルーティングの分離 (`app/`)**
   - `app/` 配下には、極力「ページとしての骨組み」と「データ取得処理」だけを置く。
   - 複雑な見た目や状態（State）を持つ部品は `components/` 側に作り、importして使う。

2. **Server Componentsの活用**
   - App Routerの利点を活かし、コンポーネントはデフォルトで「サーバーコンポーネント」として扱う。
   - Reactの `useState` や `onClick` などの「ブラウザ側の処理」が必要な一番末端のコンポーネントにのみ `"use client"` を明記する。

3. **API通信の集約 (`lib/api/`)**
   - コンポーネントの中に直接 `fetch("http://localhost:8080/...")` を書くことは禁止。
   - 必ず `lib/api/` に用意した関数を利用し、Goとの通信を一元管理する。
