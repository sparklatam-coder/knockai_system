import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "노크 병원 마케팅 플라이휠 전략",
  description: "신규 환자 확보 파이프라인과 CS 360 플라이휠을 시각화한 로컬 전략 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={notoSansKr.variable}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
