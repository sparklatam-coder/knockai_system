"use client";

import { GlobalNav } from "@/components/layout/GlobalNav";
import { Footer } from "@/components/landing/Footer";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, MapPin, Search, Camera, Star, MessageSquare, TrendingUp, Users, BarChart3 } from "lucide-react";
import { DoorKnockHero } from "@/components/landing/DoorKnockHero";
import { useCounter } from "@/hooks/useScrollAnimation";

export default function PlacePage() {
  const mau = useCounter(2650, 2000, "\uB9CC");

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <GlobalNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        <DoorKnockHero />
        <div className="container mx-auto px-6 relative">
          <div className="content-max text-center">
            <AnimatedSection>
              <div className="knock-badge-premium mb-8 mx-auto w-fit">
                네이버 플레이스 상위노출 전문
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 premium-title">
                네이버 지도에서
                <br />
                <span className="gradient-text text-5xl md:text-7xl lg:text-[5.4rem]">1등으로 보이는 병원</span>
                <br />
                만들어 드립니다
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                월 2,650만 명이 사용하는 네이버 지도.
                <br />
                상위에 노출되면, 고객이 먼저 찾아옵니다.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 rounded-xl glow-button group" asChild>
                <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer">
                  무료 플레이스 진단 받기
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 왜 네이버 지도인가 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-6">
                왜 <span className="text-accent">네이버 지도</span>가 답인가?
              </h2>
              <p className="text-muted-foreground text-center mb-16 text-lg">
                한국인 68%가 사용하는 네이버 지도. 환자는 이미 여기서 병원을 찾고 있습니다.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Users, stat: "2,650만", label: "월간 사용자 수", desc: "한국 전체 스마트폰 사용자의 68%" },
                { icon: Search, stat: "15배", label: "1위 vs 10위 클릭률 차이", desc: "상위노출이 곧 매출입니다" },
                { icon: BarChart3, stat: "72%", label: "지도 검색 후 실제 방문", desc: "검색한 고객의 72%가 방문" },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="knock-card p-8 text-center h-full hover:border-primary/40 transition-all hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-black font-display text-primary mb-2">{item.stat}</div>
                    <div className="text-lg font-bold text-foreground mb-1">{item.label}</div>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 광고 vs 자연 상위노출 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-6">
                광고 vs <span className="text-accent">자연 상위노출</span>
              </h2>
              <p className="text-muted-foreground text-center mb-16">
                똑똑한 고객은 광고를 건너뜁니다. 진짜 선택받는 건 자연 검색 1위입니다.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <AnimatedSection delay={0}>
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 h-full">
                  <div className="text-destructive font-bold text-xl mb-6">💰 광고 (유료)</div>
                  <ul className="space-y-4">
                    {["클릭당 비용 발생", "광고 표시로 신뢰도 ↓", "예산 소진 시 노출 중단", "경쟁 심할수록 단가 상승"].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-destructive mt-0.5">✕</span>
                        <span className="text-muted-foreground">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="rounded-2xl border border-success/30 bg-success/5 p-8 h-full">
                  <div className="text-success font-bold text-xl mb-6">🏆 자연 상위노출 (노크)</div>
                  <ul className="space-y-4">
                    {["비용 없이 지속적 노출", "고객 신뢰도 최상위", "한 번 구축하면 계속 유지", "진짜 고객이 선택하는 자리"].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 노크가 하는 일 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-6">노크가 하는 일</h2>
              <p className="text-muted-foreground text-center mb-16">네이버 플레이스 상위노출을 위한 6단계 종합 최적화</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Search, step: "1", title: "키워드 전략 설계", desc: "업종·지역 맞춤 핵심 키워드를 분석하고 상위노출 전략을 수립합니다." },
                { icon: Camera, step: "2", title: "전문 사진·영상 촬영", desc: "클릭을 유도하는 고퀄리티 매장 사진과 영상을 촬영합니다." },
                { icon: MapPin, step: "3", title: "플레이스 상세 최적화", desc: "메뉴, 가격, 영업시간, 편의시설 등 모든 정보를 최적화합니다." },
                { icon: Star, step: "4", title: "리뷰 관리 전략", desc: "자연스러운 리뷰 유도와 부정 리뷰 대응 전략을 세웁니다." },
                { icon: MessageSquare, step: "5", title: "네이버 예약 연동", desc: "네이버 예약 시스템을 연동해 즉시 전환 구조를 만듭니다." },
                { icon: TrendingUp, step: "6", title: "순위 모니터링·리포트", desc: "매주 순위 변동을 추적하고 성과 리포트를 제공합니다." },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.08}>
                  <div className="knock-card p-6 h-full hover:border-primary/40 transition-all hover:-translate-y-1 relative">
                    <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {item.step}
                    </div>
                    <div className="pt-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(600px,100vw)] h-[300px] bg-primary/10 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="content-max text-center space-y-8">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black">
                지금, 우리 병원의
                <br />
                <span className="text-primary">네이버 플레이스 순위</span>를
                <br />
                확인하세요
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="text-muted-foreground text-lg">무료 진단을 통해 현재 순위와 개선 포인트를 알려드립니다.</p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl px-12 py-7 rounded-xl glow-button group" asChild>
                <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer">
                  무료 플레이스 진단 받기
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
