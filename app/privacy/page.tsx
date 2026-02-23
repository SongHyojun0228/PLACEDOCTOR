import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 | 플레이스닥터",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <Link
        href="/"
        className="text-sm text-gray-400 transition-colors hover:text-primary-brand"
      >
        ← 돌아가기
      </Link>

      <h1 className="mt-6 font-display text-2xl font-bold text-gray-900">
        개인정보처리방침
      </h1>
      <p className="mt-2 text-sm text-gray-400">최종 수정일: 2026년 2월 23일</p>

      <article className="prose prose-sm prose-gray mt-10 max-w-none [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-gray-800 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_li]:text-gray-600 [&_td]:text-gray-600 [&_th]:text-gray-700">
        <p>
          플레이스닥터(이하 &ldquo;회사&rdquo;)는 「개인정보 보호법」 등 관련
          법령을 준수하며, 이용자의 개인정보를 보호하기 위해 다음과 같이
          개인정보처리방침을 수립·공개합니다.
        </p>

        <h2>1. 수집하는 개인정보 항목 및 수집 방법</h2>
        <p>회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2.5 text-left font-medium">구분</th>
              <th className="px-4 py-2.5 text-left font-medium">수집 항목</th>
              <th className="px-4 py-2.5 text-left font-medium">수집 방법</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="px-4 py-2.5">회원가입 시</td>
              <td className="px-4 py-2.5">이메일, 이름(닉네임), 카카오 고유 ID</td>
              <td className="px-4 py-2.5">카카오 소셜 로그인</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-4 py-2.5">결제 시</td>
              <td className="px-4 py-2.5">결제 수단 정보(토스페이먼츠 처리)</td>
              <td className="px-4 py-2.5">결제 과정에서 자동 수집</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5">서비스 이용 시</td>
              <td className="px-4 py-2.5">서비스 이용 기록, 접속 로그</td>
              <td className="px-4 py-2.5">자동 수집</td>
            </tr>
          </tbody>
        </table>

        <h2>2. 개인정보의 이용 목적</h2>
        <p>수집한 개인정보는 다음의 목적으로 이용합니다.</p>
        <ul>
          <li>회원 식별 및 가입 의사 확인</li>
          <li>서비스 제공 및 맞춤형 분석 결과 전달</li>
          <li>유료 서비스 결제 처리 및 환불</li>
          <li>서비스 개선 및 신규 기능 개발을 위한 통계 분석</li>
          <li>고지사항 전달 및 고객 문의 응대</li>
        </ul>

        <h2>3. 개인정보의 보유 및 이용 기간</h2>
        <p>
          ① 회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이
          필요한 경우 아래와 같이 보관합니다.
        </p>
        <ul>
          <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
          <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
          <li>접속에 관한 기록: 3개월 (통신비밀보호법)</li>
        </ul>

        <h2>4. 개인정보의 제3자 제공</h2>
        <p>
          회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
          다만, 다음의 경우에는 예외로 합니다.
        </p>
        <ul>
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 의한 경우</li>
        </ul>

        <h2>5. 개인정보 처리의 위탁</h2>
        <p>
          회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고
          있습니다.
        </p>
        <ul>
          <li>토스페이먼츠: 결제 처리</li>
          <li>Supabase (AWS): 데이터 저장 및 인증</li>
        </ul>

        <h2>6. 개인정보의 파기</h2>
        <p>
          ① 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이
          해당 개인정보를 파기합니다.
          <br />② 전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구
          삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.
        </p>

        <h2>7. 이용자의 권리 및 행사 방법</h2>
        <p>
          ① 이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제, 처리
          정지를 요구할 수 있습니다.
          <br />② 위 요청은 서비스 내 마이페이지 또는 이메일(contact@placedoctor.kr)을
          통해 할 수 있으며, 회사는 지체 없이 필요한 조치를 취합니다.
        </p>

        <h2>8. 개인정보 보호책임자</h2>
        <ul>
          <li>책임자: 플레이스닥터 대표</li>
          <li>이메일: contact@placedoctor.kr</li>
        </ul>

        <h2>9. 기타</h2>
        <p>
          이 개인정보처리방침은 2026년 2월 23일부터 적용됩니다. 변경이 있을 경우
          시행 최소 7일 전에 서비스 내 공지를 통해 안내합니다.
        </p>
      </article>
    </div>
  );
}
