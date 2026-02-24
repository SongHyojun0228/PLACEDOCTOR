"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EarlybirdModalProps {
  open: boolean;
  defaultEmail?: string;
  onClose: () => void;
}

type ContactType = "email" | "phone" | "kakao";

const CONTACT_OPTIONS: { key: ContactType; label: string; placeholder: string; inputType: string }[] = [
  { key: "email", label: "이메일", placeholder: "example@email.com", inputType: "email" },
  { key: "phone", label: "전화번호", placeholder: "010-1234-5678", inputType: "tel" },
  { key: "kakao", label: "카카오 아이디", placeholder: "카카오톡 ID", inputType: "text" },
];

export default function EarlybirdModal({ open, defaultEmail, onClose }: EarlybirdModalProps) {
  const [contactType, setContactType] = useState<ContactType>(defaultEmail ? "email" : "email");
  const [contact, setContact] = useState(defaultEmail ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = CONTACT_OPTIONS.find((o) => o.key === contactType)!;

  async function handleSubmit() {
    const trimmed = contact.trim();
    if (!trimmed) {
      setError(`${selected.label}을(를) 입력해주세요.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `[${contactType}] ${trimmed}`,
          category: "earlybird",
          difficulty: "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDone(true);
      } else {
        setError(data.message);
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setDone(false);
    setError(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/30"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              {!done ? (
                <>
                  <p className="text-center text-3xl">🎉</p>
                  <h3 className="mt-3 text-center text-lg font-bold text-gray-900">
                    현재 무료 테스트 기간입니다!
                  </h3>
                  <p className="mt-2 text-center text-sm text-gray-500">
                    정식 출시 때 알림을 받으시겠어요?
                  </p>

                  <div className="mt-5 flex gap-2">
                    {CONTACT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setContactType(opt.key);
                          setContact("");
                          setError(null);
                        }}
                        className={`flex-1 cursor-pointer rounded-lg border py-2 text-xs font-medium transition-colors ${
                          contactType === opt.key
                            ? "border-primary-brand bg-primary-brand/5 text-primary-brand"
                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type={selected.inputType}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={selected.placeholder}
                    className="mt-3 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition-colors focus:border-primary-brand focus:bg-white"
                  />

                  {error && (
                    <p className="mt-2 text-xs text-red-500">{error}</p>
                  )}

                  <div className="mt-5 flex gap-3">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="h-11 flex-1 cursor-pointer rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      닫기
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="h-11 flex-1 cursor-pointer rounded-xl bg-primary-brand text-white hover:bg-primary-brand/80"
                    >
                      {submitting ? "신청 중..." : "알림 신청"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-center text-3xl">✅</p>
                  <h3 className="mt-3 text-center text-lg font-bold text-gray-900">
                    신청 완료!
                  </h3>
                  <p className="mt-2 text-center text-sm text-gray-500">
                    정식 출시 때 알려드릴게요
                  </p>
                  <Button
                    onClick={handleClose}
                    className="mt-5 h-11 w-full cursor-pointer rounded-xl bg-primary-brand text-white hover:bg-primary-brand/80"
                  >
                    확인
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
