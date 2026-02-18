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
    q: "네이버 플레이스 점수가 뭔가요?",
    a: "사장님 가게의 네이버 플레이스 상태를 100점 만점으로 평가한 점수예요. 사진, 메뉴 설명, 리뷰, 가게 소개 등을 종합 분석해서 '어디를 고치면 좋을지' 알려드립니다.",
  },
  {
    q: "진짜 검색 순위가 올라가나요?",
    a: "네이버 검색 순위는 여러 요소가 복합적으로 작용해요. 플레이스닥터는 순위에 영향을 주는 항목들(사진, 키워드, 리뷰 등)을 개선하도록 도와드려요. 디지털 전환을 잘 한 가게는 매출이 평균 22% 높다는 통계도 있습니다.",
  },
  {
    q: "IT를 잘 몰라도 쓸 수 있나요?",
    a: "네! 가게 이름만 입력하면 AI가 알아서 분석해드려요. 어려운 용어 없이 '사진 3장 추가하세요', '이 키워드 넣으세요' 식으로 쉽게 알려드립니다.",
  },
  {
    q: "대행사랑 뭐가 다른가요?",
    a: "대행사가 첫 미팅에서 해주는 분석(가게 현황 파악, 경쟁사 비교, 개선점 도출)을 AI가 5초 만에 해드려요. 대행사는 월 50~100만원이지만, 플레이스닥터는 월 9,900원입니다.",
  },
  {
    q: "언제 출시되나요?",
    a: "현재 열심히 개발 중이에요. 이메일 남겨주시면 출시 시 가장 먼저 안내드리고, 1개월 무료 체험도 드립니다!",
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
