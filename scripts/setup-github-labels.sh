#!/usr/bin/env bash
# GitHubリポジトリにアジャイルタスク管理用のラベルを一括作成するスクリプト。
# 使い方: bash scripts/setup-github-labels.sh <owner> <repo>
# 前提: gh (GitHub CLI) がインストール済みでログイン済みであること。

set -euo pipefail

OWNER="${1:?使い方: $0 <owner> <repo>}"
REPO="${2:?使い方: $0 <owner> <repo>}"

# ラベル定義 (名前 色 説明)
declare -a LABELS=(
  "story      #0075ca  ユーザー価値が直接出るフィーチャーチケット"
  "task       #e4e669  エンジニア作業タスク（インフラ・リファクタ等）"
  "spike      #d93f0b  調査・検証チケット（Time-boxed）"
  "bug        #ee0701  既存動作が仕様と異なるバグ"
  "sprint:1   #bfd4f2  Sprint 1"
  "sprint:2   #bfd4f2  Sprint 2"
  "sprint:3   #bfd4f2  Sprint 3"
  "priority:high   #b60205  優先度 高"
  "priority:mid    #fbca04  優先度 中"
  "priority:low    #c2e0c6  優先度 低"
)

echo "🏷️  ラベルをセットアップします: $OWNER/$REPO"

for entry in "${LABELS[@]}"; do
  # フィールド分割
  label_name=$(echo "$entry" | awk '{print $1}')
  label_color=$(echo "$entry" | awk '{print $2}' | tr -d '#')
  label_desc=$(echo "$entry" | awk '{$1=$2=""; print $0}' | sed 's/^ *//')

  # ラベルを作成（既存の場合は更新）
  if gh label create "$label_name" \
      --repo "$OWNER/$REPO" \
      --color "$label_color" \
      --description "$label_desc" \
      --force 2>/dev/null; then
    echo "  ✅ $label_name"
  else
    echo "  ⚠️  $label_name のセットアップに失敗（スキップ）"
  fi
done

echo ""
echo "✨ ラベルのセットアップが完了しました！"
