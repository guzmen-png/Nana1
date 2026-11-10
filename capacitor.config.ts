import type { CapacitorConfig } from "@capacitor/cli";

/**
 * iOS 네이티브 셸은 배포된 나날 웹 앱 URL을 로드합니다.
 * 배포 후 NANAL_SERVER_URL 또는 아래 url을 실제 주소로 바꾸세요.
 */
const serverUrl =
  process.env.NANAL_SERVER_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "";

const config: CapacitorConfig = {
  appId: "app.nanal.calendar",
  appName: "나날",
  webDir: "www",
  backgroundColor: "#D7E5EE",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "nanal",
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#D7E5EE",
      showSpinner: false,
    },
  },
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
        allowNavigation: [serverUrl.replace(/^https?:\/\//, "").split("/")[0]],
      }
    : undefined,
};

export default config;
