import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
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

    const { data: payments, error } = await admin
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["paid", "cancelled", "failed"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[history] query error:", error);
      return NextResponse.json(
        { success: false, message: "결제 내역 조회 중 오류가 발생했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, payments: payments ?? [] });
  } catch (err) {
    console.error("[history] unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "요청을 처리할 수 없습니다." },
      { status: 500 },
    );
  }
}
