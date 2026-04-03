.PHONY: dev backend frontend init-db setup clean lint test dev-mock

# ==============================================================================
# 開発用コマンド (Development Commands)
# ==============================================================================

# @responsibility: バックエンドとフロントエンドを並列で起動し、開発環境を立ち上げる。
# @description: 『make dev』で2つのサービスを同時に起動します。Ctrl+Cで一括停止可能です。
dev:
	@echo "🚀 Microservices (Backend, Frontend) を起動中..."
	@echo "⚠️  注意: Python Analytics Engine は別途 Windows ホスト側での起動を想定しています。"
	make -j 2 backend frontend

# @responsibility: Hono / Cloudflare Workers (D1) のバックエンドを起動する。
backend:
	@echo "🟢 Backend (Port 8787) を起動しています..."
	cd apps/backend && bun run dev

# @responsibility: モックサーバーモードでバックエンドを起動する（外部APIへの依存なし）。
dev-mock:
	@echo "🧪 Mock Backend を起動しています..."
	cd apps/backend && bun run dev:mock

# @responsibility: vinext (Vite) のフロントエンドを起動する。
frontend:
	@echo "🌐 Frontend (Port 3001) を起動しています..."
	cd apps/frontend && bun run dev:vinext

# ==============================================================================
# データベース管理コマンド (Database Management)
# ==============================================================================

# @responsibility: ローカルの Cloudflare D1 データベースを初期化し、スキーマを適用する。
init-db:
	@echo "🗄️  Cloudflare D1 Local Database を初期化中..."
	cd apps/backend && bunx wrangler d1 execute gold_vola_db --local --file=./migrations/0001_initial_schema.sql

# @responsibility: 初回のプロジェクトセットアップ（DB初期化を含む）を実行する。
setup: init-db
	@echo "📦 セットアップ完了！ 'make dev' で開発を開始できます。"

# ==============================================================================
# 品質管理コマンド (Quality Control)
# ==============================================================================

# @responsibility: プロジェクト全体のコード規約（Lint）をチェックする。
lint:
	@echo "🔍 Lint チェックを実行中..."
	cd apps/backend && bun run lint
	cd apps/frontend && bun run lint

# @responsibility: バックエンドの単体テストを実行する。
test:
	@echo "🧪 バックエンドのテストを実行中..."
	cd apps/backend && bun test

# ==============================================================================
# お掃除コマンド (Utility)
# ==============================================================================

# @responsibility: 使用済みのポートを解放し、ゾンビプロセスを一掃する。
# @description: address already in use エラーが発生した際に実行してください。
clean:
	@echo "🧹 ゾンビプロセスの掃除を開始します..."
	# 各ポート（バックエンド:8787, フロントエンド:3001, その他:8000, 8080, 3000）を使用しているプロセスを強制終了
	-fuser -k 8787/tcp 2>/dev/null || true
	-fuser -k 3001/tcp 2>/dev/null || true
	-fuser -k 3000/tcp 2>/dev/null || true
	-fuser -k 8000/tcp 2>/dev/null || true
	-fuser -k 8080/tcp 2>/dev/null || true
	@echo "✨ クリーンアップが完了しました。"
