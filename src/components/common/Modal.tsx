import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  align?: "bottom" | "center";
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  align = "bottom",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={[
        "fixed inset-0 z-40 flex justify-center bg-stone-950/35 px-4 pt-10 backdrop-blur-sm",
        align === "center" ? "items-center pb-10" : "items-end pb-0",
      ].join(" ")}
      onClick={onClose}
      role="presentation"
    >
      <section
        className={[
          "app-scroll max-h-[90vh] w-full max-w-[560px] overflow-y-auto bg-[#fffaf3] p-5 shadow-2xl lg:border lg:border-white/70",
          align === "center"
            ? "rounded-[32px]"
            : "rounded-t-[32px] lg:mb-10 lg:rounded-[32px]",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold text-ink">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-2 text-sm text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white p-2 text-stone-500 transition hover:text-ink"
            aria-label="닫기"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
