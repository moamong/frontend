import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "./Modal";

const defaultPalette = [
  "#ef8a62",
  "#f0b27a",
  "#8dc9b5",
  "#7ea8be",
  "#f39c9c",
  "#c8a97e",
  "#9b8ad1",
  "#dc7f7f",
  "#6fb1a0",
  "#b0a79f",
  "#ffb6a3",
  "#9ac7ff",
];

type ColorPalettePickerProps = {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  description?: string;
  palette?: string[];
};

type HSV = {
  h: number;
  s: number;
  v: number;
};

export function ColorPalettePicker({
  value,
  onChange,
  title = "색상 선택",
  description = "스펙트럼에서 고르거나 HEX 값을 직접 입력해보세요.",
  palette = defaultPalette,
}: ColorPalettePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value.toUpperCase());
  const [draftColor, setDraftColor] = useState(normalizeHex(value));
  const spectrumRef = useRef<HTMLDivElement | null>(null);

  const normalizedValue = useMemo(() => normalizeHex(value), [value]);
  const normalizedInput = useMemo(() => normalizeHexInput(hexInput), [hexInput]);
  const isInputValid = isValidHex(normalizedInput);
  const hsv = useMemo(() => hexToHsv(draftColor), [draftColor]);

  useEffect(() => {
    if (isOpen) {
      const normalized = normalizeHex(value);
      setDraftColor(normalized);
      setHexInput(normalized);
    }
  }, [isOpen, value]);

  const handleSelect = (nextColor: string) => {
    const normalizedColor = normalizeHex(nextColor);
    setDraftColor(normalizedColor);
    setHexInput(normalizedColor);
    onChange(normalizedColor);
  };

  const handleSpectrumPointer = (clientX: number, clientY: number) => {
    const element = spectrumRef.current;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);

    handleSelect(
      hsvToHex({
        h: hsv.h,
        s: x,
        v: 1 - y,
      }),
    );
  };

  const startSpectrumDrag = (clientX: number, clientY: number) => {
    handleSpectrumPointer(clientX, clientY);

    const handleMove = (event: PointerEvent) => {
      handleSpectrumPointer(event.clientX, event.clientY);
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const selectorLeft = `${hsv.s * 100}%`;
  const selectorTop = `${(1 - hsv.v) * 100}%`;

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="picker-shell w-full text-left">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-stone-200">
          <div className="flex items-center gap-3">
            <span
              className="h-10 w-10 rounded-2xl ring-1 ring-black/5"
              style={{ backgroundColor: normalizedValue }}
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-medium text-stone-400">색상</p>
              <p className="mt-1 text-sm font-semibold text-stone-800">{normalizedValue}</p>
            </div>
          </div>
          <div className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-stone-600">
            변경
          </div>
        </div>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        align="center"
      >
        <div className="space-y-5">
          <div className="rounded-[24px] bg-white p-4 ring-1 ring-stone-200">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Spectrum
                </p>
                <p className="mt-1 text-sm text-stone-500">원하는 색을 자유롭게 조절해보세요.</p>
              </div>
              <span
                className="h-12 w-12 shrink-0 rounded-[18px] ring-1 ring-black/5"
                style={{ backgroundColor: draftColor }}
                aria-hidden="true"
              />
            </div>

            <div
              ref={spectrumRef}
              role="presentation"
              onPointerDown={(event) => startSpectrumDrag(event.clientX, event.clientY)}
              className="relative h-48 cursor-crosshair overflow-hidden rounded-[22px]"
              style={{
                backgroundColor: `hsl(${hsv.h} 100% 50%)`,
                backgroundImage:
                  "linear-gradient(to top, black, transparent), linear-gradient(to right, white, transparent)",
              }}
            >
              <span
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(46,39,34,0.16)]"
                style={{ left: selectorLeft, top: selectorTop }}
              />
            </div>

            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={hsv.h}
                onChange={(event) =>
                  handleSelect(
                    hsvToHex({
                      h: Number(event.target.value),
                      s: hsv.s,
                      v: hsv.v,
                    }),
                  )
                }
                className="hue-range"
                style={{
                  background:
                    "linear-gradient(90deg, #ff4d4d 0%, #ffd24d 16%, #6dd66d 33%, #57d7d7 50%, #5b7cff 67%, #c061ff 84%, #ff4d4d 100%)",
                }}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
              Palette
            </p>
            <div className="grid grid-cols-4 gap-3">
              {palette.map((color) => {
                const normalizedColor = normalizeHex(color);
                const isSelected = normalizedColor.toLowerCase() === normalizedValue.toLowerCase();

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleSelect(normalizedColor)}
                    className={[
                      "relative h-16 rounded-[20px] transition hover:scale-[1.02]",
                      isSelected
                        ? "ring-2 ring-ink ring-offset-2 ring-offset-[#fffaf3]"
                        : "ring-1 ring-black/5",
                    ].join(" ")}
                    style={{ backgroundColor: normalizedColor }}
                    aria-label={`색상 ${normalizedColor}`}
                  >
                    {isSelected ? (
                      <span className="absolute inset-0 flex items-center justify-center text-white">
                        <Check size={20} strokeWidth={2.8} aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-4 ring-1 ring-stone-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  HEX
                </p>
                <p className="mt-1 text-sm text-stone-500">직접 입력해서 원하는 색을 맞춰보세요.</p>
              </div>
              <span
                className="h-11 w-11 shrink-0 rounded-2xl ring-1 ring-black/5"
                style={{ backgroundColor: isInputValid ? normalizedInput : normalizedValue }}
                aria-hidden="true"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <input
                type="text"
                value={hexInput}
                onChange={(event) => setHexInput(event.target.value.toUpperCase())}
                placeholder="#EF8A62"
                className={[
                  "min-w-0 flex-1 rounded-2xl border-0 bg-[#fffaf3] px-4 py-3 text-base outline-none ring-1 placeholder:text-stone-400 focus:ring-2 focus:ring-coral",
                  isInputValid ? "ring-stone-200" : "ring-coral/45",
                ].join(" ")}
                maxLength={7}
              />
              <button
                type="button"
                onClick={() => {
                  if (!isInputValid) {
                    return;
                  }

                  handleSelect(normalizedInput);
                  setIsOpen(false);
                }}
                disabled={!isInputValid}
                className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                적용
              </button>
            </div>

            {!isInputValid && hexInput.trim().length > 0 ? (
              <p className="mt-2 text-xs text-coral">`#RRGGBB` 형식으로 입력해주세요.</p>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}

function normalizeHex(value: string) {
  const trimmed = value.trim();
  const withPrefix = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withPrefix.slice(0, 7).toUpperCase();
}

function normalizeHexInput(value: string) {
  const cleaned = value.replace(/[^#0-9A-Fa-f]/g, "");

  if (!cleaned) {
    return "";
  }

  return normalizeHex(cleaned.startsWith("#") ? cleaned : `#${cleaned}`);
}

function isValidHex(value: string) {
  return /^#[0-9A-F]{6}$/.test(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hexToHsv(hex: string): HSV {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;

  if (delta !== 0) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
  }

  if (h < 0) {
    h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h: Math.round(h), s, v };
}

function hsvToHex({ h, s, v }: HSV) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const r = Math.round((rPrime + m) * 255);
  const g = Math.round((gPrime + m) * 255);
  const b = Math.round((bPrime + m) * 255);

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex).replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}
