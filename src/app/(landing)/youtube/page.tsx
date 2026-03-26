"use client";

import { GlobalNav } from "@/components/layout/GlobalNav";
import { Footer } from "@/components/landing/Footer";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Play, CheckCircle, Users, Eye, TrendingUp, BarChart3,
  Target, Clapperboard, Video, Scissors, Megaphone, Search,
  Shield, Phone, Zap, Stethoscope, HeartPulse, ExternalLink, ChevronDown
} from "lucide-react";
import { DoorKnockHero } from "@/components/landing/DoorKnockHero";
import { useCounter } from "@/hooks/useScrollAnimation";
import { useState } from "react";

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="knock-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-card-hover transition-colors">
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export default function YouTubePage() {
  const subs = useCounter(41, 2000, "\uB9CC+");

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
                병원·의원·치과 유튜브 전문
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 premium-title">
                환자가 병원을 고를 때
                <br />
                <span className="gradient-text text-5xl md:text-7xl lg:text-[5.4rem]">유튜브를 먼저 봅니다</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                산부인과 분야 1위 채널(41만 구독자)을 만든 팀이
                <br />
                선생님의 병원도 유튜브 1위로 만들어 드립니다.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 rounded-xl glow-button group" asChild>
                <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer">
                  무료 채널 전략 상담받기
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 실적 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
                <span className="text-primary">의료 분야 1위</span> 유튜브 채널,
                <br />
                저희가 만들었습니다
              </h2>
              <p className="text-muted-foreground text-center mb-12">
                산부인과 분야 국내 1위 유튜브 채널을 시작부터 지금까지 기획·제작하고 있습니다.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { value: "41만+", label: "구독자", icon: Users },
                { value: "260만+", label: "단일 영상 조회수", icon: Eye },
                { value: "1위", label: "산부인과 분야", icon: TrendingUp },
                { value: "\u00D72", label: "꽈추형(19만) 대비", icon: BarChart3 },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="knock-card p-6 text-center hover:border-primary/40 transition-all hover:-translate-y-1">
                    <item.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                    <div className="text-2xl md:text-3xl font-black font-display text-primary mb-1">{item.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{item.label}</div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            {/* Comparison messages */}
            <AnimatedSection delay={0.3}>
              <div className="max-w-3xl mx-auto space-y-3 mb-12">
                <div className="knock-card p-5 text-center">
                  <p className="text-sm text-muted-foreground">
                    의료계에서 유명한 <span className="text-foreground font-semibold">꽈추형TV가 19만 구독자</span>입니다.
                    <br />
                    저희가 만든 산부인과TV는 그 <span className="text-primary font-bold">2배 이상인 41만 구독자</span>를 달성했습니다.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-sm font-medium text-foreground">
                    🔥 260만뷰 영상 하나로, <span className="text-primary font-bold">동네 병원에서 전국에서 찾아오는 병원</span>으로 바뀌었습니다.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Video + Channel info */}
            <div className="grid lg:grid-cols-5 gap-6">
              <AnimatedSection delay={0.2} className="lg:col-span-3">
                <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-card aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/_AupHKFNpjg"
                    title="산부인과TV 260만뷰 영상"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between px-1">
                  <span className="text-sm text-muted-foreground">🔥 조회수 260만+ 달성 영상</span>
                  <a href="https://www.youtube.com/watch?v=_AupHKFNpjg" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                    YouTube에서 보기 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3} className="lg:col-span-2 space-y-4">
                <div className="knock-card p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">산부인과TV</h3>
                      <p className="text-xs text-muted-foreground">채널 개설부터 현재까지 전담 운영</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    콘텐츠 전략 수립, 촬영, 편집, SEO 최적화까지 올인원으로 운영하여
                    산부인과 분야 <span className="text-primary font-semibold">국내 1위 채널</span>로 성장시켰습니다.
                  </p>
                  <a href="https://www.youtube.com/@HappyBirth119" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-primary/80 transition-colors group">
                    채널 바로가기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                <div className="knock-card p-6">
                  <h4 className="text-sm font-bold text-foreground mb-4">이런 병원도 가능합니다</h4>
                  <div className="space-y-2.5">
                    {[
                      { name: "병원", desc: "종합·대학·전문병원 채널 구축" },
                      { name: "의원", desc: "내과·외과·피부과 브랜딩" },
                      { name: "치과", desc: "임플란트·교정·심미 콘텐츠" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-card-hover">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-foreground text-sm">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 의사 공감 섹션 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
                선생님, 혹시 이런 생각
                <br />
                하고 계시지 않으신가요?
              </h2>
              <p className="text-muted-foreground text-center mb-12">유튜브를 해야 한다는 건 아는데...</p>
            </AnimatedSection>

            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                { emoji: "\uD83E\uDD14", text: "\"유튜브? 나는 의사지, 유튜버가 아닌데...\"" },
                { emoji: "\uD83D\uDE30", text: "\"카메라 앞에 서는 게 너무 부담스럽다\"" },
                { emoji: "\u23F0", text: "\"진료 끝나면 녹초인데 촬영·편집까지 할 시간이 없다\"" },
                { emoji: "\uD83D\uDE24", text: "\"한번 맡겨봤는데 의료를 전혀 모르더라. 의학적으로 틀린 자막이 나왔다\"" },
                { emoji: "\uD83E\uDD37", text: "\"시작은 했는데 구독자 200명에서 1년째 멈춰있다\"" },
                { emoji: "\uD83D\uDE1F", text: "\"옆 병원은 유튜브로 환자가 늘었다는데, 나만 뒤처지는 것 같다\"" },
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
                  그래서 저희가 <span className="text-primary">의료 전문 유튜브 팀</span>을 만들었습니다.
                </p>
                <p className="text-muted-foreground mt-2">선생님은 진료만 하세요. 나머지는 전부 저희가 합니다.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 환자 행동 변화 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <div className="knock-badge mx-auto w-fit mb-6">환자 행동 변화</div>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-12">
                환자는 이미
                <br />
                <span className="text-primary">유튜브에서 병원을 고릅니다</span>
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { stat: "82%", desc: "영상으로 먼저 검색하는 환자 비율", icon: Search },
                { stat: "3.2배", desc: "유튜브 채널 있는 병원의 신환 유입 증가율", icon: TrendingUp },
                { stat: "67%", desc: "\"영상 보고 이 병원으로 결정했다\"고 답한 환자", icon: HeartPulse },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="knock-card p-6 hover:border-primary/40 transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-3xl font-black font-display text-primary">{item.stat}</div>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={0.3}>
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-lg font-bold text-foreground">
                  유튜브가 없다는 건,
                  <br />
                  <span className="text-primary">환자가 우리 병원을 선택할 이유가 하나 줄어든다</span>는 뜻입니다.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 유튜브 없는 vs 있는 병원 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-12">
                유튜브 <span className="text-muted-foreground">없는</span> 병원 vs <span className="text-primary">있는</span> 병원
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <AnimatedSection delay={0}>
                <div className="rounded-2xl border border-border bg-card/50 p-8 relative h-full">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">유튜브 없는 병원</div>
                  <div className="space-y-3 mt-4">
                    {[
                      "네이버 블로그 광고에만 의존",
                      "신환 유입이 점점 감소",
                      "경쟁 병원에 환자를 뺏김",
                      "\"이 병원 실력 있나?\" 의심받음",
                      "의사 개인 브랜드가 없음",
                      "광고비만 늘고 효과는 제자리",
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-muted-foreground">✕</span>
                        <span className="text-muted-foreground text-sm">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="rounded-2xl border border-success/30 bg-success/5 p-8 relative h-full">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-primary rounded-full text-xs font-semibold text-primary-foreground">유튜브 있는 병원</div>
                  <div className="space-y-3 mt-4">
                    {[
                      "\"유튜브 보고 왔어요\" 환자가 직접 찾아옴",
                      "광고 없이도 신환이 꾸준히 유입",
                      "\"이 선생님이면 믿을 수 있겠다\" 신뢰 형성",
                      "지역 내 전문의 이미지 구축",
                      "의사 개인 브랜드 = 병원 자산",
                      "콘텐츠가 24시간 영업사원 역할",
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-foreground text-sm font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 선생님은 진료만 하세요 */}
      <section className="section-padding bg-card/30">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">
                선생님은 <span className="text-primary">진료만</span> 하세요
              </h2>
              <p className="text-muted-foreground text-center mb-12">월 1~2회, 30분 촬영 참여만 해주시면 됩니다.</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Stethoscope, title: "선생님이 하실 일", items: ["월 1~2회 촬영 참여 (30분)", "촬영 전 간단한 주제 확인"], highlight: false },
                { icon: Clapperboard, title: "저희가 하는 일", items: ["콘텐츠 기획·시나리오 작성", "촬영 세팅·조명·음향", "편집·자막·썸네일 제작", "SEO 최적화 업로드", "댓글 관리·커뮤니티 운영"], highlight: true },
                { icon: BarChart3, title: "매월 받으시는 것", items: ["성과 리포트 (조회수·구독자·유입)", "다음 달 콘텐츠 전략 제안", "경쟁 채널 분석 인사이트"], highlight: false },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className={`knock-card p-7 h-full ${item.highlight ? "border-primary/40 scale-[1.02]" : ""}`}>
                    <item.icon className="w-8 h-8 text-primary mb-4" />
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
          </div>
        </div>
      </section>

      {/* 6단계 프로세스 */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="content-max">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black text-center mb-4">운영 대행 6단계 프로세스</h2>
              <p className="text-muted-foreground text-center mb-12">기획부터 성과 분석까지, 체계적인 시스템으로 운영합니다</p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Target, title: "채널 전략 수립", desc: "병원 특성, 진료 과목, 타겟 환자층을 분석해 채널 방향성과 포지셔닝을 설계합니다.", step: "01" },
                { icon: Clapperboard, title: "콘텐츠 기획", desc: "환자들이 실제로 검색하는 키워드 기반으로 매월 콘텐츠 캘린더를 제작합니다.", step: "02" },
                { icon: Video, title: "전문 촬영", desc: "병원 방문 촬영. 선생님은 편하게 말씀만 해주세요. 조명·음향·카메라는 저희가 세팅합니다.", step: "03" },
                { icon: Scissors, title: "편집·썸네일", desc: "트렌디한 편집, 정확한 의학 자막, 클릭을 부르는 썸네일을 제작합니다.", step: "04" },
                { icon: Megaphone, title: "SEO 최적화 업로드", desc: "제목·태그·설명란·해시태그 최적화로 유튜브 검색 노출을 극대화합니다.", step: "05" },
                { icon: BarChart3, title: "성과 분석·개선", desc: "매월 리포트를 공유하고, 데이터 기반으로 콘텐츠 전략을 지속 개선합니다.", step: "06" },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.08}>
                  <div className="knock-card p-6 h-full hover:border-primary/40 transition-all hover:-translate-y-1 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
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
                일반 영상 업체와는
                <br />
                <span className="text-primary">다릅니다</span>
              </h2>
            </AnimatedSection>

            <div className="space-y-4">
              {[
                { title: "의료 콘텐츠 전문", desc: "의학 용어, 환자 심리, 의료법 가이드라인을 이해하는 팀입니다.", icon: Shield },
                { title: "검증된 실적", desc: "산부인과TV 41만 구독자, 260만뷰 영상 — 말이 아닌 결과로 증명합니다.", icon: TrendingUp },
                { title: "채널 성장 전략", desc: "단순 영상 제작이 아닙니다. 알고리즘 분석, 키워드 전략, 커뮤니티 운영까지.", icon: BarChart3 },
                { title: "신환 유입 중심", desc: "조회수가 아니라 '예약 전화'가 늘어나는 콘텐츠를 만듭니다.", icon: Phone },
                { title: "올인원 마케팅 연계", desc: "네이버 플레이스, SNS, 홈페이지까지 통합 마케팅이 가능합니다.", icon: Zap },
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

      {/* FAQ */}
      <section className="section-padding">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-black text-center mb-12">자주 묻는 질문</h2>
            </AnimatedSection>

            <div className="space-y-3">
              <FaqItem question="촬영할 때 제가 직접 카메라 앞에 서야 하나요?" answer="네, 선생님이 직접 출연해주시는 것이 가장 효과적입니다. 하지만 부담 없도록 대본·큐시트를 미리 준비하고, 자연스러운 대화형으로 촬영합니다." />
              <FaqItem question="월 비용이 얼마나 드나요?" answer="병원 규모, 촬영 빈도, 콘텐츠 수량에 따라 맞춤 견적을 드립니다. 무료 상담을 통해 최적의 플랜을 제안해드립니다." />
              <FaqItem question="효과가 나타나기까지 얼마나 걸리나요?" answer="보통 3~6개월 차부터 '유튜브 보고 왔어요'라는 환자분들이 늘어나기 시작합니다." />
              <FaqItem question="의료광고 심의는 어떻게 하나요?" answer="의료법과 의료광고 가이드라인을 숙지한 팀이 콘텐츠를 제작합니다. 심의가 필요한 경우 사전 검토 과정을 거칩니다." />
              <FaqItem question="이미 유튜브 채널이 있는데 리뉴얼도 가능한가요?" answer="물론입니다. 기존 채널 분석 후 브랜딩 리뉴얼, 콘텐츠 전략 재수립, 기존 영상 최적화까지 진행합니다." />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="content-max text-center space-y-8">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-black">
                1년 뒤,
                <br />
                <span className="text-primary">&quot;유튜브 보고 왔어요&quot;</span>
                <br />
                라는 환자를 만나세요
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                지금 시작하면 6개월 뒤부터 달라집니다.
                <br />
                무료 상담으로 우리 병원에 맞는 유튜브 전략을 확인하세요.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl px-12 py-7 rounded-xl glow-button group" asChild>
                <a href="https://open.kakao.com/o/saS7qini" target="_blank" rel="noopener noreferrer">
                  무료 채널 전략 상담받기
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
