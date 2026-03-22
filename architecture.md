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
│   ├── api/                     # ★ メイン バックエンドAPI (Go言語)
│   │   ├── go.mod / go.sum
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go      # アプリケーションのエントリーポイント
│   │   │
│   │   └── internal/            # 外部からインポート不可なパッケージ群
│   │       │
│   │       ├── domain/          # ── ドメイン層
│   │       │   ├── entities/    # コアエンティティ（例: price.go, user.go）
│   │       │   └── types/       # ドメイン全体で使う共通の型
│   │       │
│   │       ├── application/     # ── アプリケーション層
│   │       │   ├── port/        # ★ ポート (リポジトリ等のインターフェース定義)
│   │       │   ├── use_case/    # ユースケースの具体的なビジネスロジック実装
│   │       │   └── service/     # ドメインサービスのビジネスロジック
│   │       │
│   │       ├── interface/       # ── インターフェース層
│   │       │   ├── controller/  # HTTPコントローラー（外部からのリクエスト窓口）
│   │       │   ├── router/      # ルーティング設定
│   │       │   └── validator/   # リクエストの入力チェック（バリデーション）
│   │       │
│   │       └── infrastructure/  # ── インフラストラクチャ層
│   │           ├── database/    # 共通処理、DBや外部API（Twelve Data等）の接続
│   │           ├── repository/  # portで定義したインターフェースの具体的な実装
│   │           └── server/      # Webサーバー（EchoやGin等）の設定・起動処理
│   │
│   └── analytics/               # ★ データ分析・サブモジュール (Python)
│       ├── pyproject.toml       # Pythonの依存関係
│       ├── main.py              # 分析処理のエントリーポイント
│       ├── core/                # ボラティリティ等の計算ロジック
│       └── helpers/             # ロガーや共通ユーティリティ
│
└── tests/                       # 全体テスト（必要に応じて）
```
