"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "지금 무료로 쓸 수 있나요?",
    a: "네! 현재 테스트 기간이라 전 기능을 무료로 사용하실 수 있어요. 카카오 로그인 후 가게 URL만 입력하면 바로 진단이 시작됩니다. 무제한 진단, AI 분석, 리뷰 답변(월 50회), 경쟁 가게 비교까지 모두 무료입니다.",
  },
  {
    q: "네이버 플레이스 점수가 뭔가요?",
    a: "사장님 가게의 네이버 플레이스 상태를 100점 만점으로 평가한 점수예요. 사진, 메뉴 설명, 리뷰, 키워드, 최근 활동성 등 6개 항목을 종합 분석해서 '어디를 고치면 좋을지' 구체적으로 알려드립니다.",
  },
  {
    q: "AI 분석은 어떤 내용을 알려주나요?",
    a: "네이버 알고리즘 감점 요인 분석, 최우선 개선 액션 플랜, 상권 입지 분석(주변 지하철역·유동인구 특성), 그리고 실제 전환율이 높은 맞춤 검색어 팁까지 데이터 기반의 전문가급 리포트를 제공합니다.",
  },
  {
    q: "IT를 잘 몰라도 쓸 수 있나요?",
    a: "네! 가게 이름만 입력하면 AI가 알아서 분석해드려요. 어려운 용어 없이 '사진 3장 추가하세요', '이 키워드 넣으세요' 식으로 쉽게 알려드립니다.",
  },
  {
    q: "대행사랑 뭐가 다른가요?",
    a: "대행사가 첫 미팅에서 해주는 분석(가게 현황 파악, 경쟁사 비교, 개선점 도출)을 AI가 5초 만에 해드려요. 대행사는 월 50~100만원이지만, 플레이스닥터는 지금 무료이고 정식 출시 후에도 월 9,900원입니다.",
  },
  {
    q: "앞으로 어떤 기능이 추가되나요?",
    a: "네이버 검색 순위 실시간 추적, 주간 성적표 알림, 경쟁 가게 변동 알림, AI 소개글·메뉴 설명 자동 생성, 인스타/블로그 마케팅 콘텐츠 생성, 월간 리포트 PDF 등을 준비하고 있습니다. 정식 출시 시 얼리버드 혜택도 드려요!",
  },
];

export default function FAQ() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center font-display text-3xl font-bold text-primary-dark md:text-4xl"
        >
          자주 묻는 질문
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mt-10"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-base-light">
                <AccordionTrigger className="text-base font-semibold text-primary-dark hover:no-underline hover:text-primary-brand">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-primary-dark/70">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
