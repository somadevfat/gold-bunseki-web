.PHONY: dev backend frontend analytics clean

# ==============================================================================
# 開発用コマンド (Development Commands)
# ==============================================================================

# 『make dev』で3つのサービス（バックエンド・フロントエンド・分析エンジン）を同時に起動します
# ※ -j 3 は「3つのタスクを並列で実行する」というオプションです。Ctrl+Cを押すとすべて順番に停止します。
dev:
	@echo "🚀 Starting all microservices (Backend, Frontend, Analytics)..."
	make -j 3 backend frontend analytics

backend:
	@echo "🟢 Starting Go Backend (Port 8080)..."
	cd apps/backend && go run main.go

frontend:
	@echo "🌐 Starting Next.js Frontend (Port 3000)..."
	cd apps/frontend && bun run dev

analytics:
	@echo "🐍 Starting Python Analytics Engine (Port 8000)..."
	cd apps/analytics && . venv/bin/activate && python3 main.py

# ==============================================================================
# お掃除コマンド (Utility)
# ==============================================================================
# 『make clean』で、ポートが裏で残ってしまった（address already in use）時のゾンビプロセスを一掃します
clean:
	@echo "🧹 Cleaning up zombie processes..."
	-fuser -k 8080/tcp 2>/dev/null || true
	-fuser -k 3000/tcp 2>/dev/null || true
	-fuser -k 8000/tcp 2>/dev/null || true
	@echo "✨ Clean up complete!"
