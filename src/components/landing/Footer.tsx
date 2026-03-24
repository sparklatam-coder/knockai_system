import Link from "next/link";

export const Footer = () => (
  <footer className="border-t border-border py-10">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <img src="/landing/knock-logo.png" alt="KNOCK 병원 마케팅" className="h-12 w-auto" />
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
          <Link href="/place" className="hover:text-foreground transition-colors">네이버 플레이스</Link>
          <Link href="/youtube" className="hover:text-foreground transition-colors">유튜브</Link>
          <Link href="/references" className="hover:text-foreground transition-colors">실적</Link>
          <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">무료 상담</a>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 노크. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
