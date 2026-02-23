import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://placedoctor.kr"),
  title: "플레이스닥터 — 네이버 플레이스 AI 진단",
  description:
    "옆 가게는 왜 나보다 위에 뜰까? 네이버 플레이스 점수를 5초 만에 확인하세요. AI가 검색 순위 올리는 방법을 알려드립니다.",
  keywords: [
    "네이버 플레이스",
    "플레이스 순위",
    "소상공인",
    "플레이스 최적화",
    "네이버 검색 순위",
    "플레이스닥터",
  ],
  openGraph: {
    title: "플레이스닥터 — 네이버 플레이스 AI 진단",
    description:
      "대행사 월 50만원짜리 분석을, AI가 월 9,900원에. 네이버 플레이스 점수를 5초 만에 확인하세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "플레이스닥터",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "플레이스닥터 — 네이버 플레이스 AI 진단",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "플레이스닥터 — 네이버 플레이스 AI 진단",
    description:
      "대행사 월 50만원짜리 분석을, AI가 월 9,900원에. 네이버 플레이스 점수를 5초 만에 확인하세요.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
