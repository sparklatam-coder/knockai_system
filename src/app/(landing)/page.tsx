"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { Footer } from "@/components/landing/Footer";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, CheckCircle, Check, TrendingUp, BarChart3, Search, Star, MapPin, Sparkles, Monitor, RefreshCw, MessageCircle, X as XIcon, ChevronRight } from "lucide-react";
import { DoorKnockHero } from "@/components/landing/DoorKnockHero";


/* ── Logo Marquee with fade edges ── */
function LogoMarquee() {
  const logos = [
    "양주이지치과", "노내과의원", "제주팔팔의원", "서울미소치과",
    "강남플러스의원", "해운대정형외과", "분당삼성내과", "일산베스트치과",
    "양주이지치과", "노내과의원", "제주팔팔의원", "서울미소치과",
    "강남플러스의원", "해운대정형외과", "분당삼성내과", "일산베스트치과",
  ];
  return (
    <div className="logo-marquee-wrap">
      <div className="logo-marquee-fade" />
      <div className="logo-marquee-track">
        {logos.map((name, i) => (
          <span key={i} className="logo-marquee-item">
            <span className="logo-marquee-dot" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Animated Counter ── */
function useInViewCounter(end: number, duration: number, suffix: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState("0" + suffix);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * end) + suffix);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration, suffix]);

  return { ref, count };
}

export default function LandingPage() {
  const [doorProgress, setDoorProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const handleDoorProgress = useCallback((p: number) => setDoorProgress(p), []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const stat1 = useInViewCounter(2650, 2000, "만");
  const stat2 = useInViewCounter(68, 2000, "%");
  const stat3 = useInViewCounter(300, 2500, "%");

  /* #4 Rank chart in-view animation */
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartVisible, setChartVisible] = useState(false);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setChartVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const services = [
    { title: "네이버 플레이스", icon: MapPin, color: "#10b981", bg: "rgba(16,185,129,0.1)", items: ["상위노출 구조 설계", "사진·영상 촬영", "상세설명·메뉴·키워드 최적화", "리뷰 전략", "네이버 예약 연동", "지도에서 선택받는 구조 설계"], linkText: "네이버 플레이스 상위노출 자세히 보기 →", linkHref: "/place" },
    { title: "블로그 / 웹사이트", icon: Search, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", items: ["검색 상위 노출 컨텐츠", "브랜딩 스토리 작성", "고품질 사진/영상 콘텐츠", "홈페이지 제작/리뉴얼", "안내/예약 페이지 구축"], linkText: "블로그·웹사이트 서비스 자세히 보기 →", linkHref: "/place" },
    { title: "SNS·광고·유입 구조", icon: BarChart3, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", items: ["인스타그램 운영 / 릴스 제작", "유튜브 숏폼·영상 제작", "네이버 CPC / 파워링크 광고", "틱톡 / 카카오 / 네이버콘텐츠 광고", "랜딩페이지 최적화", "전환형 콘텐츠 설계"], linkText: "광고·유입 전략 자세히 보기 →", linkHref: "https://open.kakao.com/o/saS7qini", external: true },
    { title: "병원 성장 전략", icon: TrendingUp, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", items: ["브랜딩 전략", "영업·마케팅 세일즈 퍼널 설계", "환자 문의·예약 자동화", "CRM 기반 전환 전략 설계"], linkText: "성장 전략 상담받기 →", linkHref: "https://open.kakao.com/o/saS7qini", external: true },
  ];

  const differentiators = [
    { title: "풀스택 팀", desc: "영업(GTM) + 마케팅 + 콘텐츠 + 광고를 모두 다룰 수 있는 전략과 실행을 동시에 하는 팀입니다." },
    { title: "현장 이해 기반 전문성", desc: "신환 증가 → 예약 증가 → 재방문 증가. '현장 데이터' 기반으로 바로 매출로 이어지는 구조만 설계합니다." },
    { title: "사진·영상·홈페이지까지 한번에", desc: "촬영팀, 블로그 대행, 홈페이지 외주, SNS 운영 — 한 곳에서 해결. 관리 간편 + 예산 효율적 + 전략 일관성." },
    { title: "예쁘게가 아니라, 팔리게", desc: "보이는 화려한 결과보다 실제 문의·예약·재방문 증가에 초점. 효과가 보이는 구조만 합니다." },
  ];

  const checklist = [
    "네이버 플레이스 리뷰/상세/사진이 엉망이라 손을 못 대고 있다",
    "매출은 괜찮은데 신환 유입이 줄어들고 있다",
    "블로그/SNS를 할 시간이 도저히 없다",
    "광고를 했는데 전혀 효과가 없었다",
    "홈페이지가 예전 것이라 신뢰도가 떨어진다",
    "경쟁 병원은 검색 상위인데 우리 병원은 묻혀 있다",
    "처음부터 올인원으로 맡길 팀을 찾고 있다",
    "촬영/콘텐츠/광고/홈페이지를 따로따로 맡기기 싫다",
    "환자가 늘어나는 디지털 구조를 만들고 싶다",
  ];

  const faqs = [
    { q: "지금 블로그 리뷰만 많은데도 효과 있나요?", a: "중요한 것은 구조 최적화 + 키워드 + 상세 + 리스팅 재정비가 핵심입니다. 리뷰만으로는 상위노출이 어렵습니다." },
    { q: "광고 없이도 가능한가요?", a: "네이버 알고리즘 + 콘텐츠 + 방문 패턴 최적화만으로도 충분합니다. 오히려 자연 상위노출이 더 높은 전환율을 보입니다." },
    { q: "얼마나 걸리나요?", a: "보통 세팅 + 최적화는 2주, 효과는 평균 4주 후부터 나타납니다." },
    { q: "비용은 어떻게 되나요?", a: "병원 규모, 현재 상태, 필요한 서비스에 따라 맞춤 견적을 드립니다. 무료 상담을 통해 최적의 플랜을 제안해드립니다." },
    { q: "다른 지역에서도 가능한가요?", a: "네, 전국 어디든 가능합니다. 서울·수도권은 물론 지방 병원도 원격 + 현장 방문 병행으로 진행합니다." },
    { q: "기존 업체에서 넘어올 수 있나요?", a: "물론입니다. 기존 세팅을 분석한 뒤 부족한 부분만 보완하므로, 처음부터 다시 시작하지 않아도 됩니다." },
  ];

  const rankData = [
    { date: "11-02", rank: 69 }, { date: "11-06", rank: 66 }, { date: "11-08", rank: 63 },
    { date: "11-17", rank: 62 }, { date: "11-21", rank: 58 }, { date: "11-22", rank: 50 },
    { date: "11-23", rank: 4 }, { date: "11-25", rank: 3 }, { date: "11-27", rank: 2 },
    { date: "11-28", rank: 1 }, { date: "11-29", rank: 1 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden premium-grain">
      <GlobalNav />

      {/* ═══ HERO — dark overlay + door animation ═══ */}
      <div style={{ height: isMobile ? "auto" : "145vh", position: "relative" }}>
        <section className={`${isMobile ? "relative" : "sticky top-0"} relative pt-32 pb-20 ${isMobile ? "min-h-[80vh]" : "h-screen"} flex items-center overflow-hidden hero-dark`}>
          {!isMobile && <DoorKnockHero enableScrollOpen onProgress={handleDoorProgress} />}
          {/* Dark gradient overlay */}
          <div className="hero-overlay" />
          <div
            className="container mx-auto px-6 relative z-10"
            style={isMobile ? {} : {
              opacity: Math.max(0, 1 - doorProgress * 2.5),
              transform: `translateY(${-doorProgress * 60}px)`,
              willChange: doorProgress > 0 ? "opacity, transform" : undefined,
            }}
          >
            <div className="content-max text-center">
              <AnimatedSection>
                <div className="hero-badge mb-8 mx-auto w-fit">
                  병의원 전문 마케팅 파트너
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 hero-title">
                  환자가 원장님 문을
                  <br />
                  <span className="hero-gradient-text text-5xl md:text-7xl lg:text-[5.4rem]">
                    노크합니다
                  </span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="flex items-center justify-center gap-0 mb-8 text-2xl sm:text-3xl md:text-4xl font-black tracking-widest text-white">
                  <span>KN</span>
                  <span className="relative inline-flex items-center justify-center w-[1.1em] h-[1.1em]">
                    <span className="absolute inset-0 border-2 border-blue-400 rounded-full" style={{ boxShadow: "0 0 12px rgba(96,165,250,0.5)" }} />
                    <span className="w-[0.28em] h-[0.28em] bg-blue-400 rounded-full relative z-10" style={{ boxShadow: "0 0 8px rgba(96,165,250,0.6)" }} />
                  </span>
                  <span>CK</span>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                  환자가 두드릴 문을 제대로 만들어드립니다.
                  <br />
                  네이버 지도에서 검색하고, 비교하고,
                  <br />
                  원장님 병원을 선택하기까지 — 그 문을 설계합니다.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="hero-cta-primary group" asChild>
                    <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer">
                      무료 상담 시작하기
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                  <Button size="lg" className="hero-cta-secondary group" asChild>
                    <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer">
                      우리 병원 순위 확인하기
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </AnimatedSection>

            </div>
          </div>
        </section>
      </div>


      {/* ═══ Pain Point ═══ */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <p className="premium-subtitle text-center mb-4">Pain Point</p>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-6 premium-title">
                왜 이렇게까지 했는데도,
                <br />
                <span className="gradient-text">신환이 안 늘까?</span>
              </h2>
            </AnimatedSection>

            <div className="max-w-3xl mx-auto mt-12">
              <AnimatedSection delay={0.1}>
                <div className="comparison-grid">
                  <div className="comparison-card comparison-before">
                    <div className="comparison-label">기존 마케팅</div>
                    <ul className="comparison-list">
                      {["전단지 뿌리기", "인스타 광고 몇 번", "블로그 대행 맡기기", "리뷰 이벤트"].map((t, j) => (
                        <li key={j}><XIcon className="comparison-icon-bad" />{t}</li>
                      ))}
                    </ul>
                    <div className="comparison-result comparison-result-bad">결과: 늘 &ldquo;거기서 거기&rdquo;</div>
                  </div>
                  <div className="comparison-card comparison-after">
                    <div className="comparison-label">노크 시스템</div>
                    <ul className="comparison-list">
                      {["네이버 지도 구조 최적화", "데이터 기반 키워드 전략", "촬영+콘텐츠+광고 통합", "환자 유입 자동화 구조"].map((t, j) => (
                        <li key={j}><Check className="comparison-icon-good" />{t}</li>
                      ))}
                    </ul>
                    <div className="comparison-result comparison-result-good">결과: 신환 유입 300% 증가</div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="insight-card mt-8">
                  <p className="text-2xl md:text-3xl font-black text-center">
                    환자가 병원을 찾는 출발점은 대부분
                    <br />
                    &apos;<span className="text-accent">네이버 지도</span>&apos;라는 것.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <p className="text-center text-foreground font-black text-xl mt-8">
                  즉, <span className="text-primary">신환 = 네이버 지도 검색</span>. 이것이 지금의 공식입니다.
                </p>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section className="stats-bar">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-semibold tracking-widest text-blue-300/70 uppercase mb-8">네이버 지도, 왜 중요한가?</p>
          <div className="stats-grid">
            <div className="stat-block" ref={stat1.ref}>
              <div className="stat-number">{stat1.count}</div>
              <div className="stat-desc">월간 사용자(MAU)</div>
              <div className="stat-sub">국내 지도 앱 시장 압도적 1위</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-block" ref={stat2.ref}>
              <div className="stat-number">{stat2.count}</div>
              <div className="stat-desc">점유율</div>
              <div className="stat-sub">지도 앱 사용자 중 네이버 지도 비율</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-block">
              <div className="stat-number">½+</div>
              <div className="stat-desc">국민 절반 이상</div>
              <div className="stat-sub">&apos;지도→플레이스&apos; 검색은 기본 경로</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Proven Results ═══ */}
      <section className="section-padding bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <p className="premium-subtitle text-center mb-4">Proven Results</p>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4 premium-title">실제 결과로 증명합니다</h2>
              <p className="text-xl gradient-text-gold font-bold text-center mb-12">69위 → 1위, 딱 1달</p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="knock-card p-8" ref={chartRef}>
                <div className="flex items-end justify-between gap-2 h-64 mb-6">
                  {rankData.map((d, i) => {
                    const height = Math.max(8, ((70 - d.rank) / 69) * 100);
                    const isTop = d.rank <= 5;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className={`text-xs font-bold mb-1 transition-opacity duration-500 ${isTop ? "text-emerald-500" : "text-muted-foreground"} ${chartVisible ? "opacity-100" : "opacity-0"}`}
                          style={{ transitionDelay: `${i * 80 + 300}ms` }}>
                          {d.rank}위
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all ease-out ${isTop ? "bg-emerald-500" : "bg-primary/40"}`}
                          style={{
                            height: chartVisible ? `${height}%` : "0%",
                            minHeight: chartVisible ? "8px" : "0px",
                            transitionDuration: "800ms",
                            transitionDelay: `${i * 80}ms`,
                          }}
                        />
                        <span className="text-[11px] text-muted-foreground mt-2 hidden md:block">{d.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>

            {/* Revenue highlight */}
            <AnimatedSection delay={0.2}>
              <div className="revenue-highlight mt-12">
                <div ref={stat3.ref} className="revenue-number">{stat3.count}</div>
                <p className="text-xl md:text-2xl text-foreground font-bold mb-2">매출 증가 달성</p>
                <p className="text-muted-foreground mb-6">네이버 플레이스 상위 노출 + 체계적 디지털 마케팅으로 실제 매출 300% 증가</p>
                <Link href="/references" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                  더 많은 실적 보기 <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ Services ═══ */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <p className="premium-subtitle text-center mb-4">Our Services</p>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4 premium-title">무엇을 채워주는가?</h2>
              <p className="text-muted-foreground text-center mb-16 text-lg">
                병원 성장을 위한 모든 디지털 요소를 한 번에 해결합니다.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((svc, i) => {
                const cardContent = (
                  <div className="knock-card-glass knock-card-glow p-8 h-full cursor-pointer transition-all hover:border-[var(--knock-primary)]/[0.44]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: svc.bg }}>
                        <svc.icon className="w-5 h-5" style={{ color: svc.color }} />
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
                      <a href={svc.linkHref} target="_blank" rel="noopener noreferrer" className="block h-full">{cardContent}</a>
                    ) : (
                      <Link href={svc.linkHref} className="block h-full">{cardContent}</Link>
                    )}
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Differentiators ═══ */}
      <section className="section-padding bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <p className="premium-subtitle text-center mb-4">Differentiators</p>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-16 premium-title">어떻게 다른가?</h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6">
              {differentiators.map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="knock-card-glass knock-card-glow p-8 h-full hover:border-primary/40 transition-colors">
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

      {/* ═══ For You — Checklist ═══ */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <p className="premium-subtitle text-center mb-4">For You</p>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4 premium-title">이런 원장님께 추천드립니다</h2>
              <p className="text-muted-foreground text-center mb-12">1개라도 해당되면 노크가 답입니다.</p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="knock-card p-8 mb-12">
                <div className="space-y-2">
                  {checklist.map((item, i) => (
                    <div key={i} className="checklist-row">
                      <span className="checklist-num">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: "병원 / 종합병원", emoji: "🏥" },
                  { name: "의원 / 내과 / 외과", emoji: "🩺" },
                  { name: "치과 / 교정과", emoji: "🦷" },
                  { name: "한의원", emoji: "🌿" },
                  { name: "피부과 / 성형외과", emoji: "✨" },
                  { name: "동물병원", emoji: "🐾" },
                ].map((biz, i) => (
                  <div key={i} className="knock-card-glass p-6 text-center hover:border-primary/50 hover:scale-105 transition-all cursor-default">
                    <div className="text-4xl mb-3">{biz.emoji}</div>
                    <p className="text-foreground font-semibold">{biz.name}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ Additional Services ═══ */}
      <section className="section-padding bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-black text-center mb-4">디지털 성장을 설계합니다</h2>
              <p className="text-muted-foreground text-center mb-12">네이버 플레이스 외에도, 디지털 성장에 필요한 모든 것</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Monitor, title: "홈페이지 제작", desc: "모던하고 전환율 높은 홈페이지를 제작해 드립니다. 모바일 최적화는 기본!", emoji: "🏠" },
                { icon: RefreshCw, title: "홈페이지 리뉴얼", desc: "오래된 홈페이지를 최신 트렌드에 맞게 리뉴얼해 드립니다. 신뢰도 UP!", emoji: "🔄" },
                { icon: MessageCircle, title: "카카오톡 채널", desc: "카카오톡 채널 개설부터 운영까지, 고객과의 소통을 도와드립니다.", emoji: "💬" },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="knock-card-glass knock-card-glow p-8 text-center hover:border-primary/50 transition-all hover:-translate-y-1">
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

      {/* ═══ FAQ ═══ */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <p className="premium-subtitle text-center mb-4">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-black text-center mb-12 premium-title">자주 묻는 질문</h2>
            </AnimatedSection>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="knock-card-glass faq-premium px-6">
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

      {/* ═══ Explore More ═══ */}
      <section className="section-padding bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-2xl md:text-3xl font-black text-center mb-10">더 알아보기</h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { emoji: "📍", title: "네이버 플레이스 상위노출", sub: "69위 → 1위, 1달 만에 달성한 비결", href: "/place" },
                { emoji: "🎬", title: "유튜브로 환자 유입", sub: "41만 구독자 채널을 만든 팀", href: "/youtube" },
                { emoji: "📊", title: "실적 레퍼런스", sub: "실시간 순위 트래킹 데이터 공개", href: "/references" },
              ].map((card, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <Link href={card.href} className="explore-card group block text-center">
                    <div className="text-2xl mb-3">{card.emoji}</div>
                    <h3 className="text-base font-bold text-foreground mb-2">{card.title}</h3>
                    <p className="text-[13px] text-muted-foreground mb-4">{card.sub}</p>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold">
                      자세히 보기 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Dark CTA ═══ */}
      <section className="dark-cta">
        <div className="dark-cta-glow" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="content-max text-center space-y-8">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                지금, 원장님의 병원이
                <br />
                네이버 지도에서 얼마나
                <br />
                <span className="dark-cta-highlight">보이는지 확인해보세요</span>
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="text-slate-400 text-lg">
                3분만 투자하세요. 24시간 내에 무료 진단 리포트 + 개선 제안서를 보내드립니다.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <Button size="lg" className="dark-cta-button group" asChild>
                <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer">
                  무료 진단 요청하기
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <div className="flex items-center justify-center gap-8 mt-4">
                {["무료 상담", "24시간 내 리포트", "맞춤 제안"].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                    <Check className="w-4 h-4 text-emerald-400" />
                    {t}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
