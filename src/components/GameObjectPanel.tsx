import type { TapLabel } from "../hooks/useTapCount";

type ObjectButtonProps = {
  emoji: string;
  index: number;
  disabled: boolean;
  isTapped: boolean;
  isMuted?: boolean;
  labels: TapLabel[];
  colors: {
    border: string;
    borderActive: string;
    bg: string;
    label: string;
  };
  onTap: (index: number) => void;
};

function ObjectButton({
  emoji,
  index,
  disabled,
  isTapped,
  isMuted = false,
  labels,
  colors,
  onTap,
}: ObjectButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onTap(index)}
      disabled={disabled || isMuted}
      className={`relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border-4 text-4xl transition md:h-[4.5rem] md:w-[4.5rem] md:text-5xl ${
        isMuted
          ? "border-coral-dark/25 bg-coral/10 line-through opacity-40"
          : isTapped
            ? `${colors.borderActive} ${colors.bg} scale-95`
            : `${colors.border} bg-white hover:scale-105 active:scale-95`
      } disabled:cursor-default disabled:opacity-60`}
      aria-label={`Object ${index + 1}`}
    >
      {emoji}
      {labels.map((label) => (
        <span
          key={label.id}
          className={`animate-count-vanish pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 text-2xl font-bold drop-shadow-sm md:text-3xl ${colors.label}`}
        >
          {label.value}
        </span>
      ))}
    </button>
  );
}

type AddObjectPanelProps = {
  emoji: string;
  a: number;
  b: number;
  disabled: boolean;
  tapped: Set<number>;
  labels: TapLabel[];
  onTap: (index: number) => void;
};

export function AddObjectPanel({ emoji, a, b, disabled, tapped, labels, onTap }: AddObjectPanelProps) {
  const colors = {
    border: "border-sunshine-dark/30",
    borderActive: "border-sunshine-dark",
    bg: "bg-sunshine/25",
    label: "text-sunshine-dark",
  };

  return (
    <div className="mt-5 rounded-3xl border-4 border-sunshine-dark/35 bg-white/90 p-4 shadow-lg md:p-5">
      <p className="mb-3 text-center text-base font-bold text-sunshine-dark md:text-lg">
        Tap each one. Count them all!
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-sunshine/10 p-2">
          {Array.from({ length: a }, (_, index) => (
            <ObjectButton
              key={`a-${index}`}
              emoji={emoji}
              index={index}
              disabled={disabled}
              isTapped={tapped.has(index)}
              labels={labels.filter((label) => label.index === index)}
              colors={colors}
              onTap={onTap}
            />
          ))}
        </div>
        <span className="text-3xl font-bold text-sunshine-dark">+</span>
        <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-lavender/10 p-2">
          {Array.from({ length: b }, (_, offset) => {
            const index = a + offset;
            return (
              <ObjectButton
                key={`b-${index}`}
                emoji={emoji}
                index={index}
                disabled={disabled}
                isTapped={tapped.has(index)}
                labels={labels.filter((label) => label.index === index)}
                colors={colors}
                onTap={onTap}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

type SubtractObjectPanelProps = {
  emoji: string;
  total: number;
  takeAway: number;
  disabled: boolean;
  tapped: Set<number>;
  labels: TapLabel[];
  onTap: (index: number) => void;
};

export function SubtractObjectPanel({
  emoji,
  total,
  takeAway,
  disabled,
  tapped,
  labels,
  onTap,
}: SubtractObjectPanelProps) {
  const colors = {
    border: "border-grass-dark/30",
    borderActive: "border-grass-dark",
    bg: "bg-grass/25",
    label: "text-grass-dark",
  };

  return (
    <div className="mt-5 rounded-3xl border-4 border-coral-dark/35 bg-white/90 p-4 shadow-lg md:p-5">
      <p className="mb-3 text-center text-base font-bold text-coral-dark md:text-lg">
        {takeAway} go away. Tap what&apos;s left and count!
      </p>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {Array.from({ length: total }, (_, index) => {
          const isMuted = index < takeAway;
          return (
            <ObjectButton
              key={index}
              emoji={emoji}
              index={index}
              disabled={disabled}
              isTapped={tapped.has(index)}
              isMuted={isMuted}
              labels={labels.filter((label) => label.index === index)}
              colors={colors}
              onTap={onTap}
            />
          );
        })}
      </div>
    </div>
  );
}

const GROUP_BG = ["bg-sunshine/10", "bg-lavender/10", "bg-grass/10"] as const;
const GROUP_BORDER = [
  "border-sunshine-dark/35",
  "border-lavender-dark/35",
  "border-grass-dark/35",
] as const;

type MultiplyObjectPanelProps = {
  emoji: string;
  groups: number;
  each: number;
  disabled: boolean;
  tapped: Set<number>;
  labels: TapLabel[];
  onTap: (index: number) => void;
};

export function MultiplyObjectPanel({
  emoji,
  groups,
  each,
  disabled,
  tapped,
  labels,
  onTap,
}: MultiplyObjectPanelProps) {
  const colors = {
    border: "border-lavender-dark/30",
    borderActive: "border-lavender-dark",
    bg: "bg-lavender/25",
    label: "text-lavender-dark",
  };

  return (
    <div className="mt-5 rounded-3xl border-4 border-lavender-dark/35 bg-white/90 p-4 shadow-lg md:p-5">
      <p className="mb-3 text-center text-base font-bold text-lavender-dark md:text-lg">
        {groups} groups of {each}. Tap and count all!
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {Array.from({ length: groups }, (_, groupIndex) => {
          const start = groupIndex * each;
          return (
            <div key={groupIndex} className="flex items-center gap-2">
              {groupIndex > 0 && (
                <span className="text-2xl font-bold text-lavender-dark">×</span>
              )}
              <div
                className={`flex flex-wrap justify-center gap-2 rounded-2xl border-4 p-2 ${GROUP_BG[groupIndex % 3]} ${GROUP_BORDER[groupIndex % 3]}`}
              >
                {Array.from({ length: each }, (_, offset) => {
                  const index = start + offset;
                  return (
                    <ObjectButton
                      key={index}
                      emoji={emoji}
                      index={index}
                      disabled={disabled}
                      isTapped={tapped.has(index)}
                      labels={labels.filter((label) => label.index === index)}
                      colors={colors}
                      onTap={onTap}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type DivideObjectPanelProps = {
  emoji: string;
  total: number;
  groups: number;
  each: number;
  disabled: boolean;
  tapped: Set<number>;
  labels: TapLabel[];
  onTap: (index: number) => void;
};

export function DivideObjectPanel({
  emoji,
  total,
  groups,
  each,
  disabled,
  tapped,
  labels,
  onTap,
}: DivideObjectPanelProps) {
  const colors = {
    border: "border-sky-deep/30",
    borderActive: "border-sky-deep",
    bg: "bg-sky-bright/25",
    label: "text-sky-deep",
  };

  return (
    <div className="mt-5 rounded-3xl border-4 border-sky-deep/35 bg-white/90 p-4 shadow-lg md:p-5">
      <p className="mb-3 text-center text-base font-bold text-sky-deep md:text-lg">
        Same in each group! Tap one group and count.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {Array.from({ length: groups }, (_, groupIndex) => {
          const start = groupIndex * each;
          const isFirstGroup = groupIndex === 0;
          return (
            <div
              key={groupIndex}
              className={`flex flex-wrap justify-center gap-2 rounded-2xl border-4 p-2 ${
                isFirstGroup
                  ? "border-sky-deep/50 bg-sky-bright/15"
                  : "border-ink/10 bg-ink/5 opacity-70"
              }`}
            >
              {Array.from({ length: each }, (_, offset) => {
                const index = start + offset;
                return (
                  <ObjectButton
                    key={index}
                    emoji={emoji}
                    index={index}
                    disabled={disabled || !isFirstGroup}
                    isTapped={tapped.has(index)}
                    isMuted={!isFirstGroup}
                    labels={labels.filter((label) => label.index === index)}
                    colors={colors}
                    onTap={onTap}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-medium text-ink/50">
        {total} shared into {groups} groups
      </p>
    </div>
  );
}
