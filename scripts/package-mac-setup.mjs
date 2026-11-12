import { mkdirSync, cpSync, chmodSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const stage = resolve("dist/nanal-mac-setup-staging");
const zipPath = resolve("install/nanal-mac-setup.zip");
const artifactZip = resolve("/opt/cursor/artifacts/nanal-mac-setup.zip");

rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

const launcher = `#!/bin/bash
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
`;

writeFileSync(resolve(stage, "나날 Mac 설치하기.command"), launcher, { mode: 0o755 });
cpSync(resolve("install/mac/README.md"), resolve(stage, "README.md"));
writeFileSync(
  resolve(stage, "업로드확인.txt"),
  `이 파일은 GitHub에 업로드된 나날 Mac 설치 패키지입니다.

- 저장소: https://github.com/guzmen-png/Nana1
- 브랜치: cursor/nanal-calendar-app-738d
- iOS 패키지: install/nanal-ios-xcode.zip
- Mac 설치: 이 zip의 "나날 Mac 설치하기.command" 더블클릭

Mac에서 설치하기.command 가 저장소를 받은 뒤 Electron 나날 앱을 빌드·실행합니다.
`,
);

rmSync(zipPath, { force: true });
execSync(`cd "${stage}" && zip -qr "${zipPath}" .`, { stdio: "inherit" });
mkdirSync(resolve("/opt/cursor/artifacts"), { recursive: true });
cpSync(zipPath, artifactZip);
chmodSync(resolve("install/mac/설치하기.command"), 0o755);
chmodSync(resolve("install/mac/나날.app/Contents/MacOS/나날"), 0o755);
console.log(`package-mac-setup: ${zipPath}`);
