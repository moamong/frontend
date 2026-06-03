import { Plus } from "lucide-react";

export function FloatingRecordButton() {
  return (
    <button
      type="button"
      aria-label="기록 추가"
      className="fixed bottom-24 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-3xl text-white shadow-card transition hover:scale-105"
    >
      <Plus size={30} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
