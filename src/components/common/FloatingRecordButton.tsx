import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "./Modal";
import { RecordForm } from "../record/RecordForm";

export function FloatingRecordButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="기록 추가"
        onClick={() => setIsOpen(true)}
        className="absolute bottom-24 right-5 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-ink text-3xl text-white shadow-card transition hover:scale-105"
      >
        <Plus size={30} strokeWidth={2.5} aria-hidden="true" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="기록 추가"
        description="오늘의 수입과 지출을 간단히 남겨보세요."
      >
        <RecordForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
