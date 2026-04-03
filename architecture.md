# アーキテクチャ ディレクトリツリー（Clean Architecture）

各ディレクトリ名は `memo.md` のClean Architecture構成と完全に一致させる。

```text
gold-vola-bunseki/
│
├── README.md
├── docker/                      # Docker コンテナ関連の構成
├── docs/                        # プロジェクト全体のドキュメント
│
├── apps/
│   │
│   ├── backend/                 # ★ メイン バックエンドAPI (TypeScript / Hono)
│   │   ├── package.json
│   │   ├── wrangler.jsonc       # Cloudflare Workers 設定
│   │   ├── src/
│   │   │   ├── index.ts         # アプリケーションのエントリーポイント
│   │   │   │
│   │   │   ├── domain/          # ── ドメイン層 (Zod スキーマ, ビジネスロジック)
│   │   │   │   ├── entities/    # コアエンティティ（例: price.ts, zigzag.ts）
│   │   │   │   └── types/       # Zod OpenAPI 定義、共通の型
│   │   │   │
│   │   │   ├── application/     # ── アプリケーション層
│   │   │   │   ├── port/        # ★ ポート (リポジトリ等のインターフェース定義)
│   │   │   │   └── use_case/    # ユースケースの具体的なビジネスロジック実装
│   │   │   │
│   │   │   ├── interface/       # ── インターフェース層
│   │   │   │   ├── controller/  # Hono ハンドラ（外部からのリクエスト窓口）
│   │   │   │   ├── routes/      # Hono Zod OpenAPI ルーティング定義
│   │   │   │   └── validator/   # Zod による入力バリデーション
│   │   │   │
│   │   │   └── infrastructure/  # ── インフラストラクチャ層
│   │   │       ├── database/    # Cloudflare D1 / KV 接続
│   │   │       ├── repository/  # portで定義したインターフェースの具体的な実装
│   │   │       └── external/    # 外部API（Twelve Data, Python Analytics）の接続
│   │
│   ├── frontend/                # ★ メイン フロントエンド (Next.js / Vinext)
│   │   ├── package.json
│   │   ├── wrangler.jsonc       # Cloudflare Pages 設定
│   │   ├── src/
│   │   │   ├── app/             # App Router 定義 (Vinext 互換)
│   │   │   ├── components/      # プロジェクト全体の共通UI（Atomic Design）
│   │   │   ├── features/        # ── 機能ベースの設計（垂直分割）
│   │   │   │   ├── common/      # 共通機能 (指標選択など)
│   │   │   │   ├── sessions/    # セッション分析機能
│   │   │   │   └── market-replay/ # マーケット再現機能
│   │   │   │       ├── api/     # API通信 (fetch/hono client)
│   │   │   │       ├── components/ # 機能固有のUI
│   │   │   │       └── hooks/   # ビジネスロジック・状態管理
│   │   │   └── lib/             # 汎用ライブラリ、共通設定
│   │   └── tests/               # E2Eテスト (Playwright)
│
└── analytics/               # ★ データ分析・サブモジュール (Python)
│       ├── pyproject.toml       # Pythonの依存関係
│       ├── main.py              # 分析処理のエントリーポイント
│       ├── core/                # ボラティリティ等の計算ロジック
│       └── helpers/             # ロガーや共通ユーティリティ
│
└── tests/                       # 全体テスト（必要に応じて）
```
