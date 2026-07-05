import type { VanishLabel } from "../hooks/useVanishTapCount";

type ObjectTileProps = {
  emoji: string;
  index: number;
  disabled: boolean;
  isTapped: boolean;
  isRemoved?: boolean;
  labels: VanishLabel[];
  onTap: (index: number) => void;
  colors: {
    border: string;
    borderActive: string;
    bgTapped: string;
    label: string;
  };
};

export function ObjectTile({
  emoji,
  index,
  disabled,
  isTapped,
  isRemoved = false,
  labels,
  onTap,
  colors,
}: ObjectTileProps) {
  return (
    <button
      type="button"
      onClick={() => onTap(index)}
      disabled={disabled}
      className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border-4 text-3xl transition md:h-16 md:w-16 md:text-4xl ${
        isRemoved
          ? "border-coral-dark/40 bg-coral/10 opacity-40 line-through"
          : isTapped
            ? `${colors.borderActive} ${colors.bgTapped} scale-95`
            : `${colors.border} bg-white hover:scale-105 active:scale-95`
      } disabled:opacity-60`}
      aria-label={`Object ${index + 1}`}
    >
      {emoji}
      {labels.map((label) => (
        <span
          key={label.id}
          className={`animate-count-vanish pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 text-xl font-bold drop-shadow-sm md:text-2xl ${colors.label}`}
        >
          {label.value}
        </span>
      ))}
    </button>
  );
}

type AddVisualHelperProps = {
  emoji: string;
  a: number;
  b: number;
  disabled: boolean;
  tappedIndices: Set<number>;
  vanishLabels: VanishLabel[];
  onTap: (index: number) => void;
};

export function AddVisualHelper({
  emoji,
  a,
  b,
  disabled,
  tappedIndices,
  vanishLabels,
  onTap,
}: AddVisualHelperProps) {
  const colors = {
    border: "border-sunshine-dark/30",
    borderActive: "border-sunshine-dark",
    bgTapped: "bg-sunshine/25",
    label: "text-sunshine-dark",
  };

  return (
    <div className="animate-bounce-in mt-6 rounded-3xl border-4 border-sunshine-dark/40 bg-white/90 p-5 shadow-lg md:p-6">
      <p className="mb-4 text-center text-sm font-bold text-sunshine-dark md:text-base">
        Tap each one and count!
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: a }, (_, i) => (
            <ObjectTile
              key={`a-${i}`}
              emoji={emoji}
              index={i}
              disabled={disabled}
              isTapped={tappedIndices.has(i)}
              labels={vanishLabels.filter((label) => label.index === i)}
              onTap={onTap}
              colors={colors}
            />
          ))}
        </div>
        <span className="text-3xl font-bold text-sunshine-dark md:text-4xl">+</span>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: b }, (_, i) => {
            const index = a + i;
            return (
              <ObjectTile
                key={`b-${i}`}
                emoji={emoji}
                index={index}
                disabled={disabled}
                isTapped={tappedIndices.has(index)}
                labels={vanishLabels.filter((label) => label.index === index)}
                onTap={onTap}
                colors={colors}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

type SubtractVisualHelperProps = {
  emoji: string;
  total: number;
  takeAway: number;
  disabled: boolean;
  removedIndices: Set<number>;
  countedIndices: Set<number>;
  vanishLabels: VanishLabel[];
  onTap: (index: number) => void;
};

export function SubtractVisualHelper({
  emoji,
  total,
  takeAway,
  disabled,
  removedIndices,
  countedIndices,
  vanishLabels,
  onTap,
}: SubtractVisualHelperProps) {
  const colors = {
    border: "border-coral-dark/30",
    borderActive: "border-coral-dark",
    bgTapped: "bg-coral/20",
    label: "text-coral-dark",
  };

  return (
    <div className="animate-bounce-in mt-6 rounded-3xl border-4 border-coral-dark/40 bg-white/90 p-5 shadow-lg md:p-6">
      <p className="mb-4 text-center text-sm font-bold text-coral-dark md:text-base">
        Tap {takeAway} to take away, then count what&apos;s left!
      </p>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {Array.from({ length: total }, (_, index) => (
          <ObjectTile
            key={index}
            emoji={emoji}
            index={index}
            disabled={disabled}
            isTapped={countedIndices.has(index)}
            isRemoved={removedIndices.has(index)}
            labels={vanishLabels.filter((label) => label.index === index)}
            onTap={onTap}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
}
