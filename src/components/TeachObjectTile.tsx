type TeachObjectTileProps = {
  emoji: string;
  disabled: boolean;
  isDone: boolean;
  isRemoved?: boolean;
  isNext?: boolean;
  countLabel?: number;
  accent: "sunshine" | "coral" | "grass";
  onClick: () => void;
};

const accentStyles = {
  sunshine: {
    idle: "border-sunshine-dark/35 bg-white hover:scale-105 active:scale-95",
    next: "animate-teach-pulse border-sunshine-dark bg-sunshine/20 ring-4 ring-sunshine/40",
    done: "border-sunshine-dark bg-sunshine/30 scale-95",
    label: "text-sunshine-dark",
  },
  coral: {
    idle: "border-coral-dark/35 bg-white hover:scale-105 active:scale-95",
    next: "animate-teach-pulse border-coral-dark bg-coral/20 ring-4 ring-coral/40",
    done: "border-coral-dark bg-coral/25 scale-95",
    label: "text-coral-dark",
  },
  grass: {
    idle: "border-grass-dark/35 bg-white hover:scale-105 active:scale-95",
    next: "animate-teach-pulse border-grass-dark bg-grass/20 ring-4 ring-grass/40",
    done: "border-grass-dark bg-grass/30 scale-95",
    label: "text-grass-dark",
  },
};

export default function TeachObjectTile({
  emoji,
  disabled,
  isDone,
  isRemoved = false,
  isNext = false,
  countLabel,
  accent,
  onClick,
}: TeachObjectTileProps) {
  const styles = accentStyles[accent];

  if (isRemoved) {
    return (
      <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-coral-dark/25 bg-coral/10 text-3xl line-through opacity-40 md:h-[4.5rem] md:w-[4.5rem] md:text-4xl">
        {emoji}
      </span>
    );
  }

  const stateClass = isDone ? styles.done : isNext ? styles.next : styles.idle;

  return (
    <button
      type="button"
      disabled={disabled || isDone}
      onClick={onClick}
      className={`relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border-4 text-3xl transition md:h-[4.5rem] md:w-[4.5rem] md:text-4xl ${stateClass} disabled:cursor-default`}
    >
      {emoji}
      {countLabel !== undefined && (
        <span
          className={`animate-count-vanish pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 text-2xl font-bold drop-shadow-sm md:text-3xl ${styles.label}`}
        >
          {countLabel}
        </span>
      )}
    </button>
  );
}

export function TeachNextButton({
  label,
  onClick,
  theme,
}: {
  label: string;
  onClick: () => void;
  theme: "add" | "subtract";
}) {
  const themeClass =
    theme === "add"
      ? "border-sunshine-dark bg-sunshine text-white hover:bg-sunshine-dark"
      : "border-coral-dark bg-coral text-white hover:bg-coral-dark";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-3d animate-teach-pulse rounded-2xl border-4 px-6 py-3 text-lg font-bold md:text-xl ${themeClass}`}
    >
      {label}
    </button>
  );
}

export function TeachStepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-3 w-3 rounded-full transition ${
            index <= current ? "bg-grass scale-110" : "bg-ink/15"
          }`}
        />
      ))}
    </div>
  );
}
