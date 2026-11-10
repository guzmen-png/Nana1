import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const plistPath = resolve("ios/App/App/Info.plist");
if (!existsSync(plistPath)) {
  console.error("apply-ios-permissions: Info.plist not found");
  process.exit(1);
}

const keys = {
  NSCameraUsageDescription:
    "나날에 그날의 사진을 남기려면 카메라 접근이 필요합니다.",
  NSPhotoLibraryUsageDescription:
    "나날에 날짜별 사진을 추가하려면 사진 보관함 접근이 필요합니다.",
  NSPhotoLibraryAddUsageDescription:
    "나날에서 사진을 보관함에 저장하려면 권한이 필요합니다.",
  NSMicrophoneUsageDescription:
    "동영상 촬영 시 소리가 필요하면 마이크를 사용합니다.",
};

let xml = readFileSync(plistPath, "utf8");
for (const [key, value] of Object.entries(keys)) {
  const re = new RegExp(
    `<key>${key}</key>\\s*<string>[\\s\\S]*?</string>`,
    "m",
  );
  const block = `<key>${key}</key>\n\t<string>${value}</string>`;
  if (re.test(xml)) {
    xml = xml.replace(re, block);
  } else {
    xml = xml.replace("</dict>\n</plist>", `\t${block}\n</dict>\n</plist>`);
  }
}

if (!xml.includes("ITSAppUsesNonExemptEncryption")) {
  xml = xml.replace(
    "</dict>\n</plist>",
    `\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>\n</dict>\n</plist>`,
  );
}

writeFileSync(plistPath, xml);
console.log("apply-ios-permissions: photo/camera usage descriptions ensured");
