import Link from "next/link";

export const Footer = () => (
  <footer className="border-t border-border py-10">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <span
            style={{
              fontFamily: "'Outfit', var(--font-outfit), sans-serif",
              fontWeight: 900,
              fontSize: 22,
              display: "inline-flex",
              alignItems: "center",
              letterSpacing: "0.04em",
              color: "#0f172a",
            }}
          >
            KN
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "0.95em",
                height: "0.95em",
                border: "2.5px solid var(--knock-primary, #2563eb)",
                borderRadius: "50%",
                position: "relative",
                margin: "0 0.5px",
              }}
            >
              <span
                style={{
                  width: "0.28em",
                  height: "0.28em",
                  background: "var(--knock-primary, #2563eb)",
                  borderRadius: "50%",
                }}
              />
            </span>
            CK
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
          <Link href="/place" className="hover:text-foreground transition-colors">네이버 플레이스</Link>
          <Link href="/youtube" className="hover:text-foreground transition-colors">유튜브</Link>
          <Link href="/references" className="hover:text-foreground transition-colors">실적</Link>
          <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">무료 상담</a>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 노크. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
