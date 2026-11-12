#!/bin/bash
set -euo pipefail
BRANCH="cursor/nanal-calendar-app-738d"
REPO="https://github.com/guzmen-png/Nana1.git"
DEST="$HOME/nanal-calendar"

echo "나날 Mac 설치를 시작합니다…"
if ! command -v git >/dev/null 2>&1; then
  echo "git 이 필요합니다. Xcode Command Line Tools를 설치하세요: xcode-select --install"
  read -r -p "Enter…"
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js LTS가 필요합니다: https://nodejs.org"
  read -r -p "Enter…"
  exit 1
fi

if [ -d "$DEST/.git" ]; then
  cd "$DEST"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH" || true
else
  rm -rf "$DEST"
  git clone --branch "$BRANCH" "$REPO" "$DEST"
  cd "$DEST"
fi

chmod +x "install/mac/설치하기.command" "install/mac/나날.app/Contents/MacOS/나날"
open "install/mac/설치하기.command"
