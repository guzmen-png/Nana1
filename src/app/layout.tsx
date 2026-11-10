import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_KR, Song_Myung } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Song_Myung({
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "나날",
  description: "날짜별 사진과 프로젝트를 담는 아이폰용 캘린더",
  applicationName: "나날",
  appleWebApp: {
    capable: true,
    title: "나날",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#D7E5EE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
