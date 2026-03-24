"use client";

import Link from "next/link";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { Footer } from "@/components/landing/Footer";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, CheckCircle, Check, TrendingUp, BarChart3, Search, Camera, Star, MessageSquare, MapPin, Users, Sparkles, Monitor, RefreshCw, MessageCircle, ChevronDown } from "lucide-react";
import { useCounter } from "@/hooks/useScrollAnimation";

export default function LandingPage() {
  const mau = useCounter(2650, 2000, "\uB9CC");
  const share = useCounter(68, 2000, "%");
  const revenue = useCounter(300, 2500, "%");

  const rankData = [
    { date: "11-02", rank: 69 }, { date: "11-06", rank: 66 }, { date: "11-08", rank: 63 },
    { date: "11-17", rank: 62 }, { date: "11-21", rank: 58 }, { date: "11-22", rank: 50 },
    { date: "11-23", rank: 4 }, { date: "11-25", rank: 3 }, { date: "11-27", rank: 2 },
    { date: "11-28", rank: 1 }, { date: "11-29", rank: 1 },
  ];

  const worries = [
    "\uB124\uC774\uBC84 \uD50C\uB808\uC774\uC2A4\xB7\uBE14\uB85C\uADF8 \uAD00\uB9AC\uD560 \uC2DC\uAC04 \uC5C6\uACE0",
    "\uC0AC\uC9C4\xB7\uC601\uC0C1 \uCC0D\uC744 \uC5EC\uC720\uB3C4 \uC5C6\uACE0",
    "\uAD11\uACE0\uB97C \uC5B4\uB5BB\uAC8C \uD574\uC57C \uD6A8\uC728\uC774 \uB098\uC624\uB294\uC9C0 \uBAA8\uB974\uACE0",
    "\uD648\uD398\uC774\uC9C0\uB294 \uC624\uB798\uB418\uC5B4 \uC2E0\uB8B0\uB3C4\uAC00 \uB5A8\uC5B4\uC9C0\uACE0",
    "SNS\uB294 \uD0A4\uC6CC\uB193\uC544\uB3C4 \uB9E4\uCD9C\uACFC \uC5F0\uACB0\uC774 \uC548 \uB418\uACE0",
    "\uACBD\uC7C1 \uBCD1\uC6D0\uC740 \uC774\uBBF8 \uB514\uC9C0\uD138 \uB9C8\uCF00\uD305\uC744 \uC801\uADF9 \uD65C\uC6A9 \uC911",
  ];

  const services: Array<{ title: string; icon: typeof MapPin; items: string[]; linkText: string; linkHref: string; external?: boolean }> = [
    { title: "네이버 플레이스", icon: MapPin, items: ["상위노출 구조 설계", "사진·영상 촬영", "상세설명·메뉴·키워드 최적화", "리뷰 전략", "네이버 예약 연동", "지도에서 선택받는 구조 설계"], linkText: "네이버 플레이스 상위노출 자세히 보기 →", linkHref: "/place" },
    { title: "블로그 / 웹사이트", icon: Search, items: ["검색 상위 노출 컨텐츠", "브랜딩 스토리 작성", "고품질 사진/영상 콘텐츠", "홈페이지 제작/리뉴얼", "안내/예약 페이지 구축"], linkText: "블로그·웹사이트 서비스 자세히 보기 →", linkHref: "/place" },
    { title: "SNS·광고·유입 구조", icon: BarChart3, items: ["인스타그램 운영 / 릴스 제작", "유튜브 숏폼·영상 제작", "네이버 CPC / 파워링크 광고", "틱톡 / 카카오 / 네이버콘텐츠 광고", "랜딩페이지 최적화", "전환형 콘텐츠 설계"], linkText: "광고·유입 전략 자세히 보기 →", linkHref: "https://tally.so/r/q45d67", external: true },
    { title: "병원 성장 전략", icon: TrendingUp, items: ["브랜딩 전략", "영업·마케팅 세일즈 퍼널 설계", "환자 문의·예약 자동화", "CRM 기반 전환 전략 설계"], linkText: "성장 전략 상담받기 →", linkHref: "https://tally.so/r/q45d67", external: true },
  ];

  const differentiators = [
    { title: "\uD480\uC2A4\uD0DD \uD300", desc: "\uC601\uC5C5(GTM) + \uB9C8\uCF00\uD305 + \uCF58\uD150\uCE20 + \uAD11\uACE0\uB97C \uBAA8\uB450 \uB2E4\uB8F0 \uC218 \uC788\uB294 \uC804\uB7B5\uACFC \uC2E4\uD589\uC744 \uB3D9\uC2DC\uC5D0 \uD558\uB294 \uD300\uC785\uB2C8\uB2E4." },
    { title: "\uD604\uC7A5 \uC774\uD574 \uAE30\uBC18 \uC804\uBB38\uC131", desc: "\uC2E0\uD658 \uC99D\uAC00 \u2192 \uC608\uC57D \uC99D\uAC00 \u2192 \uC7AC\uBC29\uBB38 \uC99D\uAC00. '\uD604\uC7A5 \uB370\uC774\uD130' \uAE30\uBC18\uC73C\uB85C \uBC14\uB85C \uB9E4\uCD9C\uB85C \uC774\uC5B4\uC9C0\uB294 \uAD6C\uC870\uB9CC \uC124\uACC4\uD569\uB2C8\uB2E4." },
    { title: "\uC0AC\uC9C4\xB7\uC601\uC0C1\xB7\uD648\uD398\uC774\uC9C0\uAE4C\uC9C0 \uD55C\uBC88\uC5D0", desc: "\uCD2C\uC601\uD300, \uBE14\uB85C\uADF8 \uB300\uD589, \uD648\uD398\uC774\uC9C0 \uC678\uC8FC, SNS \uC6B4\uC601 \u2014 \uD55C \uACF3\uC5D0\uC11C \uD574\uACB0. \uAD00\uB9AC \uAC04\uD3B8 + \uC608\uC0B0 \uD6A8\uC728\uC801 + \uC804\uB7B5 \uC77C\uAD00\uC131." },
    { title: "\uC608\uC058\uAC8C\uAC00 \uC544\uB2C8\uB77C, \uD314\uB9AC\uAC8C", desc: "\uBCF4\uC774\uB294 \uD654\uB824\uD55C \uACB0\uACFC\uBCF4\uB2E4 \uC2E4\uC81C \uBB38\uC758\xB7\uC608\uC57D\xB7\uC7AC\uBC29\uBB38 \uC99D\uAC00\uC5D0 \uCD08\uC810. \uD6A8\uACFC\uAC00 \uBCF4\uC774\uB294 \uAD6C\uC870\uB9CC \uD569\uB2C8\uB2E4." },
  ];

  const checklist = [
    "\uB124\uC774\uBC84 \uD50C\uB808\uC774\uC2A4 \uB9AC\uBDF0/\uC0C1\uC138/\uC0AC\uC9C4\uC774 \uC5C9\uB9DD\uC774\uB77C \uC190\uC744 \uBABB \uB300\uACE0 \uC788\uB2E4",
    "\uB9E4\uCD9C\uC740 \uAD1C\uCC2E\uC740\uB370 \uC2E0\uD658 \uC720\uC785\uC774 \uC904\uC5B4\uB4E4\uACE0 \uC788\uB2E4",
    "\uBE14\uB85C\uADF8/SNS\uB97C \uD560 \uC2DC\uAC04\uC774 \uB3C4\uC800\uD788 \uC5C6\uB2E4",
    "\uAD11\uACE0\uB97C \uD588\uB294\uB370 \uC804\uD600 \uD6A8\uACFC\uAC00 \uC5C6\uC5C8\uB2E4",
    "\uD648\uD398\uC774\uC9C0\uAC00 \uC608\uC804 \uAC83\uC774\uB77C \uC2E0\uB8B0\uB3C4\uAC00 \uB5A8\uC5B4\uC9C4\uB2E4",
    "\uACBD\uC7C1 \uBCD1\uC6D0\uC740 \uAC80\uC0C9 \uC0C1\uC704\uC778\uB370 \uC6B0\uB9AC \uBCD1\uC6D0\uC740 \uBBBB\uD600 \uC788\uB2E4",
    "\uCC98\uC74C\uBD80\uD130 \uC62C\uC778\uC6D0\uC73C\uB85C \uB9E1\uAE38 \uD300\uC744 \uCC3E\uACE0 \uC788\uB2E4",
    "\uCD2C\uC601/\uCF58\uD150\uCE20/\uAD11\uACE0/\uD648\uD398\uC774\uC9C0\uB97C \uB530\uB85C\uB530\uB85C \uB9E1\uAE30\uAE30 \uC2EB\uB2E4",
    "\uD658\uC790\uAC00 \uB298\uC5B4\uB098\uB294 \uB514\uC9C0\uD138 \uAD6C\uC870\uB97C \uB9CC\uB4E4\uACE0 \uC2F6\uB2E4",
  ];

  const targetBusinesses = [
    { name: "\uBCD1\uC6D0 / \uC885\uD569\uBCD1\uC6D0", emoji: "\uD83C\uDFE5" },
    { name: "\uC758\uC6D0 / \uB0B4\uACFC / \uC678\uACFC", emoji: "\uD83E\uDE7A" },
    { name: "\uCE58\uACFC / \uAD50\uC815\uACFC", emoji: "\uD83E\uDDB7" },
    { name: "\uD55C\uC758\uC6D0", emoji: "\uD83C\uDF3F" },
    { name: "\uD53C\uBD80\uACFC / \uC131\uD615\uC678\uACFC", emoji: "\u2728" },
    { name: "\uB3D9\uBB3C\uBCD1\uC6D0", emoji: "\uD83D\uDC3E" },
  ];


  const faqs = [
    { q: "\uC9C0\uAE08 \uBE14\uB85C\uADF8 \uB9AC\uBDF0\uB9CC \uB9CE\uC740\uB370\uB3C4 \uD6A8\uACFC \uC788\uB098\uC694?", a: "\uC911\uC694\uD55C \uAC83\uC740 \uAD6C\uC870 \uCD5C\uC801\uD654 + \uD0A4\uC6CC\uB4DC + \uC0C1\uC138 + \uB9AC\uC2A4\uD305 \uC7AC\uC815\uBE44\uAC00 \uD575\uC2EC\uC785\uB2C8\uB2E4. \uB9AC\uBDF0\uB9CC\uC73C\uB85C\uB294 \uC0C1\uC704\uB178\uCD9C\uC774 \uC5B4\uB835\uC2B5\uB2C8\uB2E4." },
    { q: "\uAD11\uACE0 \uC5C6\uC774\uB3C4 \uAC00\uB2A5\uD55C\uAC00\uC694?", a: "\uB124\uC774\uBC84 \uC54C\uACE0\uB9AC\uC998 + \uCF58\uD150\uCE20 + \uBC29\uBB38 \uD328\uD134 \uCD5C\uC801\uD654\uB9CC\uC73C\uB85C\uB3C4 \uCDA9\uBD84\uD569\uB2C8\uB2E4. \uC624\uD788\uB824 \uC790\uC5F0 \uC0C1\uC704\uB178\uCD9C\uC774 \uB354 \uB192\uC740 \uC804\uD658\uC728\uC744 \uBCF4\uC785\uB2C8\uB2E4." },
    { q: "\uC5BC\uB9C8\uB098 \uAC78\uB9AC\uB098\uC694?", a: "\uBCF4\uD1B5 \uC138\uD305 + \uCD5C\uC801\uD654\uB294 2\uC8FC, \uD6A8\uACFC\uB294 \uD3C9\uADE0 4\uC8FC \uD6C4\uBD80\uD130 \uB098\uD0C0\uB0A9\uB2C8\uB2E4." },
    { q: "\uBE44\uC6A9\uC740 \uC5B4\uB5BB\uAC8C \uB418\uB098\uC694?", a: "\uBCD1\uC6D0 \uADDC\uBAA8, \uD604\uC7AC \uC0C1\uD0DC, \uD544\uC694\uD55C \uC11C\uBE44\uC2A4\uC5D0 \uB530\uB77C \uB9DE\uCDA4 \uACAC\uC801\uC744 \uB4DC\uB9BD\uB2C8\uB2E4. \uBB34\uB8CC \uC0C1\uB2F4\uC744 \uD1B5\uD574 \uCD5C\uC801\uC758 \uD50C\uB79C\uC744 \uC81C\uC548\uD574\uB4DC\uB9BD\uB2C8\uB2E4." },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <GlobalNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            src="/landing/knock-hero-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="content-max text-center">
            <AnimatedSection>
              <div className="knock-badge mb-8 mx-auto w-fit">
                병의원 전문 마케팅 파트너
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                환자가 원장님 문을
                <br />
                <span className="text-[var(--knock-primary)] text-5xl md:text-7xl lg:text-[5.4rem]">
                  노크합니다
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              {/* KNOCK logo text with doorknob O */}
              <div className="flex items-center justify-center gap-0 mb-8 text-3xl md:text-4xl font-black tracking-widest text-foreground">
                <span>KN</span>
                <span className="relative inline-flex items-center justify-center w-[1.1em] h-[1.1em]">
                  <span className="absolute inset-0 border-2 border-[var(--knock-primary)] rounded-full" />
                  <span className="w-[0.3em] h-[0.3em] bg-[var(--knock-primary)] rounded-full" />
                </span>
                <span>CK</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                환자가 두드릴 문을 제대로 만들어드립니다.
                <br />
                네이버 지도에서 검색하고, 비교하고,
                <br />
                원장님 병원을 선택하기까지 — 그 문을 설계합니다.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[var(--knock-primary)] text-white hover:bg-[var(--knock-primary-hover)] font-bold text-lg px-8 py-6 rounded-xl glow-button group" asChild>
                  <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer">
                    무료 상담 시작하기
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-[var(--knock-primary)] text-foreground hover:bg-[var(--knock-primary)]/10 font-semibold text-lg px-8 py-6 rounded-xl group" asChild>
                  <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer">
                    우리 병원 순위 확인하기
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </div>
            </AnimatedSection>

            {/* YouTube teaser */}
            <AnimatedSection delay={0.4}>
              <Link
                href="/youtube"
                className="inline-block mt-8 transition-colors"
                style={{
                  background: "var(--knock-bg-glass)",
                  border: "1px solid var(--knock-border)",
                  borderRadius: "var(--knock-radius-md)",
                  padding: "12px 20px",
                  fontSize: 13,
                  color: "var(--knock-text-muted)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--knock-primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--knock-border)"; }}
              >
                🎬 유튜브로 환자를 모으고 싶다면 → 유튜브 서비스 보기
              </Link>
            </AnimatedSection>

            {/* Scroll indicator */}
            <AnimatedSection delay={0.5}>
              <div className="mt-12 flex justify-center animate-bounce">
                <ChevronDown className="w-6 h-6 text-muted-foreground" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 고민 섹션 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-6">
                왜 이렇게까지 했는데도,
                <br />
                <span className="text-primary">신환이 안 늘까?</span>
              </h2>
            </AnimatedSection>

            <div className="max-w-3xl mx-auto space-y-6 mt-12">
              <AnimatedSection delay={0.1}>
                <p className="text-xl text-foreground font-semibold">혹시 이런 고민, 하고 계신가요?</p>
              </AnimatedSection>
              <AnimatedSection delay={0.15}>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="text-primary font-semibold">신환이 끊겼다.</span> 전단지, 인스타 광고, 블로그, 리뷰 이벤트까지 다 해봤는데 환자는 늘 &quot;거기서 거기&quot;인 느낌.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <p className="text-muted-foreground leading-relaxed">
                  마케팅 전문가를 써보기도 했지만 돈만 쓰고, 눈에 보이는 결과는 애매하고… &quot;도대체 뭐가 문제인지&quot; 더 모르겠는 상태.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.3}>
                <p className="text-xl font-bold text-foreground">그러다 한 가지를 분명히 깨달았습니다.</p>
              </AnimatedSection>
              <AnimatedSection delay={0.35}>
                <div className="p-6 rounded-2xl bg-card border border-primary/30 mt-4">
                  <p className="text-2xl md:text-3xl font-black text-center">
                    환자가 병원을 찾는 출발점은 대부분
                    <br />
                    &apos;<span className="text-accent">네이버 지도</span>&apos;라는 것.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    예전에는 네이버 블로그, 카페 글, 기사를 보고 병원을 찾았습니다.
                    <br />
                    하지만 지금은 다릅니다.
                  </p>
                  <p className="text-foreground font-semibold text-lg">
                    환자는 <span className="text-accent">&apos;지역 + 병원 과목&apos;</span>으로 검색합니다.
                    <br />
                    자기 집 근처에서, 네이버 지도로.
                  </p>
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <p className="text-foreground font-medium text-center">
                      기존 환자가 만족했다면? → 다시 그 병원에 갑니다.
                      <br />
                      불만족했다면? → <span className="text-primary font-bold">네이버 지도에서 새 병원을 검색합니다.</span>
                    </p>
                  </div>
                  <p className="text-center text-foreground font-black text-xl mt-4">
                    즉, <span className="text-primary">신환 = 네이버 지도 검색</span>. 이것이 지금의 공식입니다.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 왜 네이버 지도인가 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-16">
                왜 <span className="text-accent">네이버 지도</span>인가?
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <AnimatedSection delay={0}>
                <div className="knock-card p-8 text-center h-full">
                  <div ref={mau.ref} className="text-4xl md:text-5xl font-black font-display text-primary mb-2">{mau.count}</div>
                  <p className="text-lg font-bold text-foreground mb-1">월간 사용자(MAU)</p>
                  <p className="text-sm text-muted-foreground">국내 지도 앱 시장 압도적 1위</p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <div className="knock-card p-8 text-center h-full">
                  <div ref={share.ref} className="text-4xl md:text-5xl font-black font-display text-primary mb-2">{share.count}</div>
                  <p className="text-lg font-bold text-foreground mb-1">점유율</p>
                  <p className="text-sm text-muted-foreground">지도 앱 사용자 중 네이버 지도 비율</p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="knock-card p-8 text-center h-full">
                  <div className="text-4xl md:text-5xl font-black font-display text-primary mb-2">½+</div>
                  <p className="text-lg font-bold text-foreground mb-1">국민 절반 이상</p>
                  <p className="text-sm text-muted-foreground">&apos;지도→플레이스&apos; 검색은 기본 경로</p>
                </div>
              </AnimatedSection>
            </div>

            {/* Worries checklist */}
            <AnimatedSection delay={0.1}>
              <div className="knock-card p-8 md:p-10">
                <p className="text-xl font-bold text-foreground mb-6">
                  고객은 온라인에서 찾습니다. 문제는, 대부분의 원장님들은 거기에 시간을 쓸 여유가 없습니다.
                </p>
                <div className="space-y-3 mb-8">
                  {worries.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-foreground font-semibold text-center">
                    <span className="text-primary">노크</span>는 바로 이 &apos;현장의 문제&apos;를 해결하기 위해 탄생했습니다.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 실적 섹션 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">실제 결과로 증명합니다</h2>
              <p className="text-xl text-primary font-bold text-center mb-12">69위 → 1위, 딱 1달</p>
            </AnimatedSection>

            {/* Rank chart */}
            <AnimatedSection delay={0.1}>
              <div className="knock-card p-8">
                <div className="flex items-end justify-between gap-2 h-64 mb-6">
                  {rankData.map((d, i) => {
                    const height = Math.max(8, ((70 - d.rank) / 69) * 100);
                    const isTop = d.rank <= 5;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className={`text-xs font-bold mb-1 ${isTop ? "text-success" : "text-muted-foreground"}`}>
                          {d.rank}위
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${isTop ? "bg-success" : "bg-primary/40"}`}
                          style={{ height: `${height}%`, minHeight: "8px" }}
                        />
                        <span className="text-[10px] text-muted-foreground mt-2 hidden md:block">{d.date}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  {[
                    "\u2705 첫 페이지 노출 = 고객의 눈에 가장 먼저",
                    "\u2705 경쟁업체보다 우선 선택 = 전환율 대폭 증가",
                    "\u2705 신규 고객 유입 자동화 = 광고비 없이 지속 노출",
                  ].map((text, i) => (
                    <div key={i} className="p-4 rounded-xl bg-success/5 border border-success/20 text-center">
                      <p className="text-sm text-foreground font-medium">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/20 text-center">
                  <p className="text-foreground font-semibold italic">
                    &quot;환자가 검색하는 순간, 원장님의 병원이 가장 먼저 보입니다.&quot;
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 매출 증가 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max text-center">
            <AnimatedSection>
              <div ref={revenue.ref} className="text-7xl md:text-9xl font-black font-display text-primary mb-4">
                {revenue.count}
              </div>
              <p className="text-xl md:text-2xl text-foreground font-bold mb-4">매출 증가 달성</p>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                네이버 플레이스 상위 노출 + 체계적 디지털 마케팅으로 실제 매출 300% 증가 달성
              </p>
              <div className="inline-block p-6 rounded-2xl bg-primary/10 border border-primary/30 mb-8">
                <p className="text-xl font-bold text-foreground">
                  &quot;더 이상 예약을 받을 수 없는 <span className="text-primary">최대 매출 달성했습니다</span>&quot;
                </p>
              </div>
              <div>
                <Link
                  href="/references"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[var(--knock-primary)] font-semibold transition-colors"
                  style={{ border: "1px solid var(--knock-primary)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--knock-primary-dim)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  더 많은 실적 보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 알고리즘 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-2xl md:text-4xl font-black text-center mb-8 leading-tight">
                아직도 블로그 글과 리뷰만 늘리면
                <br />
                된다고 믿으시나요?
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="knock-card p-8 mb-8">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  네이버 플레이스 알고리즘은 계속 변화하고 있습니다. 상위노출은 <span className="text-primary font-bold">정량 데이터(조회수·체류·클릭)</span>와 <span className="text-accent font-bold">정성 데이터(콘텐츠 품질·메뉴 구조·사진 신뢰도)</span>를 균형적으로 충족해야만 가능합니다.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="knock-card p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xl md:text-2xl font-black text-foreground mb-3">
                      여러 가지 지표를 확인하고,
                      <br />
                      분석하고, <span className="text-primary">결정 내립니다.</span>
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      조회수, 체류시간, 클릭률, 리뷰 품질, 사진 신뢰도, 메뉴 구조…
                      <br />
                      모든 데이터를 종합 분석해 최적의 전략을 설계합니다.
                    </p>
                  </div>
                  <div className="flex-shrink-0 relative w-32 h-32 md:w-40 md:h-40">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[spin_12s_linear_infinite]" />
                    <div className="absolute inset-3 rounded-full border-2 border-accent/30 animate-[spin_8s_linear_infinite_reverse]" />
                    <div className="absolute inset-6 rounded-full border-2 border-primary/40 animate-[spin_6s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BarChart3 className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30 text-center">
                <p className="text-foreground font-semibold">
                  데이터로 올리고, 구조로 유지합니다.
                  <br />
                  <span className="text-primary">한번 올라가면, 절대 떨어지지 않는 구조.</span>
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 서비스 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">무엇을 채워주는가?</h2>
              <p className="text-muted-foreground text-center mb-16 text-lg">
                병원 성장을 위한 모든 디지털 요소를 한 번에 해결합니다.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((svc, i) => {
                const cardContent = (
                  <div className="knock-card p-8 h-full cursor-pointer transition-all hover:border-[var(--knock-primary)]/[0.44]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <svc.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{svc.title}</h3>
                    </div>
                    <ul className="space-y-2.5 mb-6">
                      {svc.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-[13px] font-medium text-[var(--knock-blue)] hover:text-[var(--knock-primary)] transition-colors">
                      {svc.linkText}
                    </div>
                  </div>
                );

                return (
                  <AnimatedSection key={i} delay={i * 0.1}>
                    {svc.external ? (
                      <a href={svc.linkHref} target="_blank" rel="noopener noreferrer" className="block h-full">
                        {cardContent}
                      </a>
                    ) : (
                      <Link href={svc.linkHref} className="block h-full">
                        {cardContent}
                      </Link>
                    )}
                  </AnimatedSection>
                );
              })}
            </div>

            <AnimatedSection delay={0.4}>
              <p className="text-xl font-bold text-center mt-12 text-foreground">
                노크는 <span className="text-primary">&quot;환자가 실제로 늘어나는 구조&quot;</span>를 만들어드립니다.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 차별점 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-16">어떻게 다른가?</h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6">
              {differentiators.map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="knock-card p-8 h-full hover:border-primary/40 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed pl-9">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={0.4}>
              <p className="text-center mt-10 text-[15px]">
                <span className="text-muted-foreground">우리의 마케팅 시스템이 궁금하다면 → </span>
                <Link href="/system" className="text-[var(--knock-blue)] font-semibold hover:text-[var(--knock-primary)] transition-colors">
                  노크 시스템 보기
                </Link>
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 추천 대상 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">이런 원장님께 추천드립니다</h2>
              <p className="text-muted-foreground text-center mb-12">1개라도 해당되면 노크가 답입니다.</p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="knock-card p-8 mb-12">
                <div className="space-y-3">
                  {checklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-card-hover transition-colors">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {targetBusinesses.map((biz, i) => (
                  <div key={i} className="knock-card p-6 text-center hover:border-primary/50 hover:scale-105 transition-all cursor-default">
                    <div className="text-4xl mb-3">{biz.emoji}</div>
                    <p className="text-foreground font-semibold">{biz.name}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 추가 서비스 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-black text-center mb-4">디지털 성장을 설계합니다</h2>
              <p className="text-muted-foreground text-center mb-12">네이버 플레이스 외에도, 디지털 성장에 필요한 모든 것</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Monitor, title: "홈페이지 제작", desc: "모던하고 전환율 높은 홈페이지를 제작해 드립니다. 모바일 최적화는 기본!", emoji: "\uD83C\uDFE0" },
                { icon: RefreshCw, title: "홈페이지 리뉴얼", desc: "오래된 홈페이지를 최신 트렌드에 맞게 리뉴얼해 드립니다. 신뢰도 UP!", emoji: "\uD83D\uDD04" },
                { icon: MessageCircle, title: "카카오톡 채널", desc: "카카오톡 채널 개설부터 운영까지, 고객과의 소통을 도와드립니다.", emoji: "\uD83D\uDCAC" },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="knock-card p-8 text-center hover:border-primary/50 transition-all hover:-translate-y-1">
                    <div className="text-5xl mb-4">{item.emoji}</div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-black text-center mb-12">자주 묻는 질문</h2>
            </AnimatedSection>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="knock-card px-6">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* 더 알아보기 카드 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-2xl md:text-3xl font-black text-center mb-10">더 알아보기</h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { emoji: "\uD83D\uDCCD", title: "네이버 플레이스 상위노출", sub: "69위 → 1위, 1달 만에 달성한 비결", href: "/place" },
                { emoji: "\uD83C\uDFAC", title: "유튜브로 환자 유입", sub: "41만 구독자 채널을 만든 팀", href: "/youtube" },
                { emoji: "\uD83D\uDCCA", title: "실적 레퍼런스", sub: "실시간 순위 트래킹 데이터 공개", href: "/references" },
              ].map((card, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <Link
                    href={card.href}
                    className="block text-center transition-all hover:shadow-[0_4px_20px_rgba(233,69,96,0.15)]"
                    style={{
                      background: "var(--knock-bg-card)",
                      border: "1px solid var(--knock-border)",
                      borderRadius: "var(--knock-radius-lg)",
                      padding: 24,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--knock-primary)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--knock-border)"; }}
                  >
                    <div className="text-2xl mb-3">{card.emoji}</div>
                    <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-[13px] text-[var(--knock-text-muted)] mb-4">{card.sub}</p>
                    <span className="text-[var(--knock-primary)] text-sm font-semibold">자세히 보기 →</span>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta-section" className="section-padding relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="content-max text-center space-y-8">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black">
                지금, 원장님의 병원이
                <br />
                네이버 지도에서 얼마나
                <br />
                <span className="text-primary">보이는지 확인해보세요</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="text-muted-foreground text-lg">
                3분만 투자하세요. 24시간 내에 무료 진단 리포트 + 개선 제안서를 보내드립니다.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl px-12 py-7 rounded-xl glow-button group" asChild>
                <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer">
                  무료 진단 요청하기
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
