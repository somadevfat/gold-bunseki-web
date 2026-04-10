# ============================
# ビルドステージ（依存解決）
# ============================
FROM oven/bun:1.2-alpine AS deps
WORKDIR /app

# package.jsonのみコピー（bun.lockはOS間差異でエラーになるためDocker内で新規生成する）
COPY package.json ./

# 本番依存のみをインストール
RUN bun install --production

# ============================
# 実行ステージ
# ============================
FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

USER bun

COPY --from=deps --chown=bun:bun /app/node_modules ./node_modules
COPY --chown=bun:bun . .

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]