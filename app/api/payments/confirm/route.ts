import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount } = (await request.json()) as {
      paymentKey: string;
      orderId: string;
      amount: number;
    };

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { success: false, message: "필수 파라미터가 누락되었습니다." },
        { status: 400 },
      );
    }

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

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "서버 설정 오류입니다." },
        { status: 500 },
      );
    }

    // pending 레코드 확인 (본인 결제만)
    const { data: payment } = await admin
      .from("payments")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 결제 정보입니다." },
        { status: 400 },
      );
    }

    // 금액 검증
    if (payment.amount !== amount) {
      return NextResponse.json(
        { success: false, message: "결제 금액이 일치하지 않습니다." },
        { status: 400 },
      );
    }

    // 토스페이먼츠 결제 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey || secretKey === "your_toss_secret_key") {
      console.log("[confirm] TOSS_SECRET_KEY 미설정 — 테스트 모드");
    } else {
      const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");
      const tossRes = await fetch(
        "https://api.tosspayments.com/v1/payments/confirm",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${encodedKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        },
      );

      if (!tossRes.ok) {
        const tossError = await tossRes.json();
        console.error("[confirm] Toss API error:", tossError);

        await admin
          .from("payments")
          .update({ status: "failed" })
          .eq("id", orderId);

        return NextResponse.json(
          {
            success: false,
            message: tossError.message || "결제 승인에 실패했습니다.",
          },
          { status: 400 },
        );
      }
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // payments 업데이트
    await admin
      .from("payments")
      .update({
        status: "paid",
        toss_payment_key: paymentKey,
        paid_at: now.toISOString(),
      })
      .eq("id", orderId);

    // users 플랜 업데이트
    await admin
      .from("users")
      .update({
        plan: payment.plan,
        plan_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      plan: payment.plan,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("[confirm] unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "결제 승인 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
