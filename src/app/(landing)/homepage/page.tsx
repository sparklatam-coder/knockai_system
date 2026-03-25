"use client";

import { GlobalNav } from "@/components/layout/GlobalNav";
import { Footer } from "@/components/landing/Footer";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckCircle, Globe, Smartphone, Search, Zap,
  BarChart3, Shield, Clock, Users, Palette, Code,
  MousePointerClick, CalendarCheck, MessageSquare, Bot,
  Layers, Gauge, Lock, ChevronDown, MonitorSmartphone, Workflow,
} from "lucide-react";
import { DoorKnockHero } from "@/components/landing/DoorKnockHero";
import { useState } from "react";

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="knock-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-card-hover transition-colors">
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export default function HomepagePage() {
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
                병원 홈페이지 자동화 시스템
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 premium-title">
                환자가 신뢰하는
                <br />
                <span className="gradient-text text-5xl md:text-7xl lg:text-[5.4rem]">병원 홈페이지</span>를
                <br />
                만들어 드립니다
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                예약 자동화, 모바일 최적화, 네이버 SEO까지.
                <br />
                환자가 검색하고, 신뢰하고, 예약까지 이어지는
                <br />
                병원 전용 홈페이지를 구축합니다.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 rounded-xl glow-button group" asChild>
                <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer">
                  무료 홈페이지 진단 받기
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 왜 홈페이지가 중요한가 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
                왜 <span className="text-primary">병원 홈페이지</span>가 중요한가?
              </h2>
              <p className="text-muted-foreground text-center mb-16 text-lg">
                네이버 플레이스에서 병원을 찾은 환자가 다음으로 하는 행동
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Search, stat: "78%", label: "홈페이지 추가 검색", desc: "플레이스에서 관심 가진 환자의 78%가 홈페이지를 확인합니다" },
                { icon: MousePointerClick, stat: "3.2배", label: "예약 전환율 차이", desc: "홈페이지 있는 병원 vs 없는 병원의 예약 전환율 차이" },
                { icon: Shield, stat: "91%", label: "신뢰도 상승", desc: "\"홈페이지가 있으니 믿을 수 있다\"고 답한 환자 비율" },
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

      {/* 원장님 고민 섹션 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
                원장님, 혹시 이런 고민
                <br />
                하고 계시지 않으신가요?
              </h2>
              <p className="text-muted-foreground text-center mb-12">홈페이지를 만들어야 하는데...</p>
            </AnimatedSection>

            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                { emoji: "😓", text: "\"홈페이지가 10년 전에 만든 건데, 모바일에서 보면 깨진다\"" },
                { emoji: "💸", text: "\"업체한테 500만원 줬는데 결과물이 너무 촌스럽다\"" },
                { emoji: "📱", text: "\"환자가 홈페이지에서 바로 예약할 수 있으면 좋겠는데\"" },
                { emoji: "🔍", text: "\"네이버에서 병원 이름 검색하면 홈페이지가 안 뜬다\"" },
                { emoji: "⏰", text: "\"홈페이지 수정하려면 업체에 연락하고 2주를 기다려야 한다\"" },
                { emoji: "🤷", text: "\"디자인도 기능도 요즘 트렌드에 안 맞는 것 같다\"" },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <div className="flex items-start gap-4 knock-card p-5 hover:border-primary/30 transition-colors">
                    <span className="text-2xl mt-0.5">{item.emoji}</span>
                    <span className="text-foreground font-medium italic">{item.text}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={0.3}>
              <div className="mt-12 text-center">
                <p className="text-xl font-bold text-foreground">
                  그래서 저희가 <span className="text-primary">병원 전용 홈페이지 자동화 시스템</span>을 만들었습니다.
                </p>
                <p className="text-muted-foreground mt-2">환자가 검색하고, 신뢰하고, 예약까지 — 이 흐름을 설계합니다.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 홈페이지 없는 vs 있는 병원 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-12">
                홈페이지 <span className="text-muted-foreground">없는</span> 병원 vs <span className="text-primary">있는</span> 병원
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <AnimatedSection delay={0}>
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 h-full">
                  <div className="text-destructive font-bold text-xl mb-6">❌ 홈페이지 없거나 오래된 병원</div>
                  <ul className="space-y-4">
                    {[
                      "네이버 검색에서 병원 정보가 부족",
                      "\"이 병원 아직 운영하나?\" 의심",
                      "모바일에서 깨지는 레이아웃",
                      "예약은 전화로만 가능",
                      "경쟁 병원에 환자를 뺏김",
                      "신뢰도·전문성 전달 불가",
                    ].map((text, i) => (
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
                  <div className="text-success font-bold text-xl mb-6">✅ 노크 홈페이지가 있는 병원</div>
                  <ul className="space-y-4">
                    {[
                      "네이버 검색 상위 노출 + SEO 최적화",
                      "모바일 완벽 대응 반응형 디자인",
                      "온라인 예약·상담 자동 접수",
                      "환자 후기·의료진 소개로 신뢰 구축",
                      "24시간 자동 안내 시스템",
                      "전문적이고 세련된 브랜드 이미지",
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-foreground font-medium">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 노크 홈페이지의 핵심 기능 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
                노크 홈페이지의 <span className="text-primary">핵심 기능</span>
              </h2>
              <p className="text-muted-foreground text-center mb-16">단순한 홈페이지가 아닙니다. 환자를 모으는 자동화 시스템입니다.</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: MonitorSmartphone, title: "반응형 디자인", desc: "PC, 태블릿, 모바일 어디서든 완벽하게 보이는 디자인. 환자의 80%는 모바일로 접속합니다." },
                { icon: CalendarCheck, title: "온라인 예약 시스템", desc: "네이버 예약·카카오톡·자체 예약 폼을 연동해 24시간 예약 접수가 가능합니다." },
                { icon: Search, title: "네이버 SEO 최적화", desc: "병원명, 진료 과목, 지역 키워드로 네이버 검색 상위 노출되도록 구조를 설계합니다." },
                { icon: Bot, title: "챗봇 자동 상담", desc: "자주 묻는 질문(진료 시간, 위치, 비용 등)을 챗봇이 24시간 자동으로 답변합니다." },
                { icon: Gauge, title: "빠른 로딩 속도", desc: "3초 안에 로딩되는 최적화 기술. 느린 홈페이지는 환자의 53%가 이탈합니다." },
                { icon: Lock, title: "보안 인증(SSL)", desc: "HTTPS 보안 인증서 적용으로 \"안전하지 않은 사이트\" 경고가 뜨지 않습니다." },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.08}>
                  <div className="knock-card p-6 h-full hover:border-primary/40 transition-all hover:-translate-y-1 relative">
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

      {/* 자동화 시스템 플로우 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
                <span className="text-primary">자동화 시스템</span>이 일합니다
              </h2>
              <p className="text-muted-foreground text-center mb-16">원장님이 진료하는 동안, 홈페이지가 환자를 모읍니다.</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Search, title: "환자가 검색", items: ["\"강남 피부과\" 네이버 검색", "홈페이지가 상위에 노출", "깔끔한 디자인에 클릭"], highlight: false },
                { icon: Workflow, title: "자동 안내·상담", items: ["진료 과목·의료진 자동 안내", "챗봇이 질문에 즉시 응답", "진료 시간·위치·주차 안내"], highlight: true },
                { icon: CalendarCheck, title: "예약·전환", items: ["온라인 예약 폼 자동 접수", "카카오톡 알림 자동 발송", "예약 확인 문자 자동 전송"], highlight: false },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className={`knock-card p-7 h-full ${item.highlight ? "border-primary/40 scale-[1.02]" : ""}`}>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {i + 1}
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Step {i + 1}</span>
                    </div>
                    <item.icon className="w-8 h-8 text-primary mb-4 mt-2" />
                    <h3 className="text-lg font-bold text-foreground mb-4">{item.title}</h3>
                    <div className="space-y-2.5">
                      {item.items.map((text, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={0.3}>
              <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-lg font-bold text-foreground">
                  이 모든 과정이 <span className="text-primary">24시간 자동으로</span> 돌아갑니다.
                  <br />
                  원장님은 진료에만 집중하세요.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 제작 프로세스 6단계 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">홈페이지 제작 6단계 프로세스</h2>
              <p className="text-muted-foreground text-center mb-12">체계적인 프로세스로 빠르고 정확하게 구축합니다</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Users, step: "1", title: "요구사항 분석", desc: "병원 특성, 진료 과목, 타겟 환자층을 분석하고 홈페이지 방향성을 설계합니다." },
                { icon: Palette, step: "2", title: "디자인 시안", desc: "병원 브랜드에 맞는 3가지 디자인 시안을 제안하고, 원장님이 선택합니다." },
                { icon: Code, step: "3", title: "개발·구축", desc: "반응형 웹사이트를 개발하고, 예약 시스템·챗봇·SEO를 모두 세팅합니다." },
                { icon: Smartphone, step: "4", title: "모바일 최적화", desc: "모바일 환경에서 완벽하게 작동하도록 테스트하고 최적화합니다." },
                { icon: Zap, step: "5", title: "런칭·연동", desc: "네이버 플레이스, 카카오톡, SNS 등 기존 채널과 완벽하게 연동합니다." },
                { icon: BarChart3, step: "6", title: "운영·개선", desc: "월간 방문자 분석 리포트를 제공하고, 데이터 기반으로 지속 개선합니다." },
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

      {/* 차별점 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-12">
                일반 웹 에이전시와는
                <br />
                <span className="text-primary">다릅니다</span>
              </h2>
            </AnimatedSection>

            <div className="space-y-4">
              {[
                { title: "병원 전문 제작 경험", desc: "의료법, 환자 동선, 진료 과목별 특성을 이해하는 팀이 만듭니다. 일반 업체에 맡기면 놓치는 디테일을 잡습니다.", icon: Layers },
                { title: "예약 자동화 내장", desc: "홈페이지 = 예쁜 간판이 아닙니다. 예약 접수, 알림 발송, 환자 DB 관리까지 하나의 시스템입니다.", icon: Workflow },
                { title: "네이버 플레이스 연동", desc: "홈페이지와 네이버 플레이스를 연동해 검색 노출을 극대화합니다. SEO 전문가가 직접 최적화합니다.", icon: Search },
                { title: "빠른 수정·업데이트", desc: "\"2주 걸립니다\"는 없습니다. 간단한 수정은 당일, 페이지 추가도 3일 이내에 처리합니다.", icon: Clock },
                { title: "성과 측정 가능", desc: "방문자 수, 예약 전환율, 인기 페이지 등 데이터를 매월 리포트로 제공합니다.", icon: BarChart3 },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.06}>
                  <div className="knock-card p-6 flex items-start gap-4 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 포함 사항 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
                기본 제공 사항
              </h2>
              <p className="text-muted-foreground text-center mb-12">추가 비용 없이 모두 포함됩니다</p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="knock-card p-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "반응형 디자인 (PC + 모바일 + 태블릿)",
                    "온라인 예약 시스템 연동",
                    "네이버 SEO 최적화",
                    "SSL 보안 인증서",
                    "카카오톡 채널 연동",
                    "진료 과목별 상세 페이지",
                    "의료진 소개 페이지",
                    "오시는 길 + 지도 연동",
                    "환자 후기 게시판",
                    "블로그/공지사항 게시판",
                    "Google Analytics 설치",
                    "1년 무료 유지보수",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-card-hover transition-colors">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
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

            <div className="space-y-3">
              <FaqItem question="제작 기간은 얼마나 걸리나요?" answer="기본 홈페이지는 2~3주, 예약 자동화 + 챗봇 포함 시 3~4주 소요됩니다. 긴급 제작(1주)도 가능합니다." />
              <FaqItem question="기존 홈페이지 리뉴얼도 가능한가요?" answer="물론입니다. 기존 홈페이지의 콘텐츠와 이미지를 활용해 최신 디자인과 기능으로 업그레이드합니다." />
              <FaqItem question="도메인과 호스팅은 어떻게 되나요?" answer="기존 도메인이 있으면 그대로 사용하고, 없으면 도메인 등록부터 호스팅 세팅까지 모두 대행합니다." />
              <FaqItem question="제작 후 수정이 필요하면 어떻게 하나요?" answer="1년 무료 유지보수가 포함됩니다. 간단한 텍스트·이미지 수정은 당일 처리, 페이지 추가도 3일 이내에 가능합니다." />
              <FaqItem question="비용은 어떻게 되나요?" answer="병원 규모, 페이지 수, 자동화 기능 범위에 따라 맞춤 견적을 드립니다. 무료 상담을 통해 최적의 플랜을 제안해드립니다." />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="content-max text-center space-y-8">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black">
                환자가 신뢰하는
                <br />
                <span className="text-primary">병원 홈페이지</span>,
                <br />
                지금 시작하세요
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                현재 홈페이지 무료 진단 + 개선 제안서를 보내드립니다.
                <br />
                3분만 투자하세요.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl px-12 py-7 rounded-xl glow-button group" asChild>
                <a href="https://tally.so/r/q45d67" target="_blank" rel="noopener noreferrer">
                  무료 홈페이지 진단 받기
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">상담은 무료입니다 · 부담 없이 편하게 문의하세요</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
