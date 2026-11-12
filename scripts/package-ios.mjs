import { mkdirSync, existsSync, rmSync, cpSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const outDir = resolve("dist");
const stage = resolve("dist/nanal-ios-staging");
const zipPath = resolve("dist/nanal-ios-xcode.zip");
const installZip = resolve("install/nanal-ios-xcode.zip");
const artifactZip = resolve("/opt/cursor/artifacts/nanal-ios-xcode.zip");

if (!existsSync(resolve("ios/App/App.xcodeproj"))) {
  console.error("package-ios: ios project missing. Run: npx cap add ios");
  process.exit(1);
}

// sync first (may regenerate plist/config), then re-apply photo permissions
execSync("npx cap sync ios", { stdio: "inherit", env: process.env });
execSync("node scripts/apply-ios-permissions.mjs", { stdio: "inherit" });

if (!existsSync(resolve("ios/App/App/public/index.html"))) {
  console.error("package-ios: missing ios/App/App/public after sync");
  process.exit(1);
}
if (!existsSync(resolve("ios/App/App/capacitor.config.json"))) {
  console.error("package-ios: missing capacitor.config.json after sync");
  process.exit(1);
}

rmSync(stage, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(stage, { recursive: true });
mkdirSync(resolve("install"), { recursive: true });

cpSync(resolve("ios"), resolve(stage, "ios"), { recursive: true });
cpSync(resolve("www"), resolve(stage, "www"), { recursive: true });
cpSync(resolve("capacitor.config.ts"), resolve(stage, "capacitor.config.ts"));
cpSync(resolve("package.json"), resolve(stage, "package.json"));
cpSync(resolve("package-lock.json"), resolve(stage, "package-lock.json"));

writeFileSync(
  resolve(stage, "INSTALL_KR.md"),
  `# 나날 아이폰 앱 설치 (Xcode)

이 압축 파일은 **사진 보관함/카메라 접근 권한**이 포함된 나날 iOS 프로젝트입니다.

## 필요한 것
- Mac + Xcode 15+
- Apple ID (무료 개발자 서명으로 본인 iPhone 설치 가능)
- 유료 Apple Developer면 TestFlight/App Store 배포 가능

## 설치 순서
1. Mac에서 이 zip을 푼 뒤 \`ios/App/App.xcodeproj\` 를 Xcode로 엽니다.
2. 상단 타깃 **App** → **Signing & Capabilities** 에서 Team을 본인 Apple ID로 선택합니다.
3. Bundle Identifier가 고유한지 확인합니다 (기본: \`app.nanal.calendar\`).
4. 연결된 iPhone을 선택하고 ▶ Run 으로 설치합니다.
5. 처음 사진 추가 시 iOS가 **사진/카메라 접근 허용** 팝업을 띄웁니다.

## 서버 URL 연결
배포된 나날 웹 주소를 Capacitor가 열도록 하려면 저장소 루트에서:

\`\`\`bash
NANAL_SERVER_URL=https://your-nanal-url npm run cap:sync
npm run ios:package
\`\`\`

## 권한 문구 (Info.plist)
- NSPhotoLibraryUsageDescription — 사진 보관함
- NSCameraUsageDescription — 카메라
- NSPhotoLibraryAddUsageDescription — 보관함 저장

Safari **홈 화면에 추가**만으로도 웹 앱은 쓸 수 있지만, 시스템 권한 팝업이 있는 아이폰 앱은 이 Xcode 프로젝트를 빌드해야 합니다.
`,
);

rmSync(zipPath, { force: true });
execSync(`cd "${stage}" && zip -qr "${zipPath}" . -x "*.DS_Store"`, {
  stdio: "inherit",
});
cpSync(zipPath, installZip);
mkdirSync(resolve("/opt/cursor/artifacts"), { recursive: true });
cpSync(zipPath, artifactZip);

const plist = execSync(
  `unzip -p "${zipPath}" ios/App/App/Info.plist`,
).toString("utf8");
for (const key of [
  "NSPhotoLibraryUsageDescription",
  "NSCameraUsageDescription",
  "NSPhotoLibraryAddUsageDescription",
]) {
  if (!plist.includes(key)) {
    console.error(`package-ios: zip Info.plist missing ${key}`);
    process.exit(1);
  }
}

console.log(`package-ios: wrote ${zipPath}`);
console.log(`package-ios: wrote ${installZip}`);
console.log(`package-ios: copied ${artifactZip}`);
