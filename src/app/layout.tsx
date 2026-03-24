import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./tailwind.css";
import "./globals.css";
import "../../knock-design-system.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "노크 병원 마케팅 시스템",
  description: "신규 환자 확보 파이프라인과 CS 360 노크 시스템을 시각화한 로컬 전략 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className={notoSansKr.variable}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
