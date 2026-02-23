import { NextResponse } from "next/server";
import { generateReviewReplies } from "@/lib/ai/reviewReply";
import type { Review, ReviewTone } from "@/types";

const VALID_TONES: ReviewTone[] = ["friendly", "professional", "humorous"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { review, storeName, tone } = body as {
      review?: Review;
      storeName?: string;
      tone?: ReviewTone;
    };

    if (!review?.content || typeof review.content !== "string" || review.content.trim().length === 0) {
      return NextResponse.json(
        { error: "리뷰 내용이 필요합니다." },
        { status: 400 }
      );
    }

    if (!tone || !VALID_TONES.includes(tone)) {
      return NextResponse.json(
        { error: "유효한 톤을 선택해주세요." },
        { status: 400 }
      );
    }

    const replies = await generateReviewReplies(
      review,
      storeName || "가게",
      tone
    );

    if (!replies) {
      return NextResponse.json(
        { error: "답변 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({ replies });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "답변 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
