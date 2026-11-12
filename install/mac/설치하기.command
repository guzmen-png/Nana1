#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "======================================"
echo " 나날 Mac 앱 설치"
echo "======================================"
echo "위치: $(pwd)"
echo ""

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js LTS가 필요합니다: https://nodejs.org"
  read -r -p "종료하려면 Enter…"
  exit 1
fi

chmod +x "install/mac/나날.app/Contents/MacOS/나날" || true

echo "[1/2] 패키지 설치 (처음엔 수 분 걸릴 수 있어요)…"
npm install

echo "[2/2] 앱 빌드…"
env -u DATABASE_URL npm run build

echo ""
echo "설치 완료. 나날 앱을 실행합니다…"
mkdir -p "$HOME/Applications"
rm -rf "$HOME/Applications/나날.app"
cp -R "install/mac/나날.app" "$HOME/Applications/나날.app"
# Keep a stable copy of project path for the app? Launcher uses relative path from
# install/mac/나날.app inside the repo, so open the repo copy (not ~/Applications)
# unless we rewrite the launcher. Open the repo-bundled app:
open "install/mac/나날.app"

# Also place a helper app in Applications that jumps to this project
HELPER="$HOME/Applications/나날.app/Contents/MacOS/나날"
cat > "$HELPER" <<EOF
#!/bin/bash
cd "$PWD"
export PATH="/opt/homebrew/bin:/usr/local/bin:\$PATH"
exec npx electron "$PWD/electron/main.mjs"
EOF
chmod +x "$HELPER"
# Copy Info.plist already there from cp -R; rewrite executable helper above
cp "install/mac/나날.app/Contents/Info.plist" "$HOME/Applications/나날.app/Contents/Info.plist"

echo ""
echo "실행됨: 이 폴더의 install/mac/나날.app"
echo "바로가기: $HOME/Applications/나날.app"
echo "첫 실행이 막히면 우클릭 → 열기"
echo ""
read -r -p "완료. Enter를 누르면 닫습니다…"
