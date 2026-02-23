import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const PLAN_PRICES: Record<string, number> = {
  basic: 9900,
  pro: 19900,
};

const PLAN_NAMES: Record<string, string> = {
  basic: "플레이스닥터 베이직 플랜",
  pro: "플레이스닥터 프로 플랜",
};

export async function POST(request: Request) {
  try {
    const { plan } = (await request.json()) as { plan: string };

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json(
        { success: false, message: "올바른 플랜을 선택해주세요." },
        { status: 400 },
      );
    }

    const amount = PLAN_PRICES[plan];
    const orderName = PLAN_NAMES[plan];

    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // service role로 DB 조작 (RLS 우회)
    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "서버 설정 오류입니다." },
        { status: 500 },
      );
    }

    // users 테이블에 행이 없으면 자동 생성 (FK 제약 충족)
    await admin.from("users").upsert(
      { id: user.id, email: user.email ?? "" },
      { onConflict: "id", ignoreDuplicates: true },
    );

    const { data, error } = await admin
      .from("payments")
      .insert({
        user_id: user.id,
        amount,
        plan,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[checkout] insert error:", error);
      return NextResponse.json(
        { success: false, message: "결제 준비 중 오류가 발생했습니다." },
        { status: 500 },
      );
    }

    const orderId = data.id;

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      orderName,
      customerKey: user.id,
    });
  } catch (err) {
    console.error("[checkout] unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "요청을 처리할 수 없습니다." },
      { status: 500 },
    );
  }
}
