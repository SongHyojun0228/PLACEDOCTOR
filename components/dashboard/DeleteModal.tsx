"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DeleteModalProps {
  open: boolean;
  storeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ open, storeName, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-50 bg-black/30"
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <p className="text-center text-3xl">🗑️</p>
              <h3 className="mt-3 text-center text-lg font-bold text-gray-900">
                진단 기록 삭제
              </h3>
              <p className="mt-2 text-center text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{storeName}</span>
                의 진단 기록을 삭제할까요?
              </p>
              <p className="mt-1 text-center text-xs text-gray-400">
                삭제된 기록은 복구할 수 없습니다.
              </p>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="h-11 flex-1 cursor-pointer rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  취소
                </Button>
                <Button
                  onClick={onConfirm}
                  className="h-11 flex-1 cursor-pointer rounded-xl bg-red-500 text-white hover:bg-red-600"
                >
                  삭제
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
