export default function Footer() {
  return (
    <footer className="bg-base-dark py-10">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          {/* 로고 + 문의 */}
          <div className="text-center md:text-left">
            <p className="font-logo text-lg tracking-wide text-white">
              플레이스닥터
            </p>
            <a
              href="mailto:contact@placedoctor.kr"
              className="mt-2 inline-block text-sm text-base-light/40 transition-colors hover:text-base-light/70"
            >
              contact@placedoctor.kr
            </a>
          </div>

          {/* 링크 */}
          <div className="flex gap-6 text-sm text-base-light/30">
            <a href="/terms" className="transition-colors hover:text-base-light/60">
              이용약관
            </a>
            <a href="/privacy" className="transition-colors hover:text-base-light/60">
              개인정보처리방침
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-base-light/25">
            &copy; 2026 PlaceDoctor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
