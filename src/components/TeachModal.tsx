import type { ReactNode } from "react";

type TeachTheme = "add" | "subtract";

type TeachModalProps = {
  open: boolean;
  title: string;
  theme: TeachTheme;
  onClose: () => void;
  onReplay: () => void;
  children: ReactNode;
};

const themeStyles: Record<TeachTheme, { panel: string; title: string; replay: string }> = {
  add: {
    panel: "border-sunshine-dark/50 bg-gradient-to-b from-white to-sunshine/10",
    title: "text-sunshine-dark",
    replay: "border-sunshine-dark bg-sunshine text-white hover:bg-sunshine-dark",
  },
  subtract: {
    panel: "border-coral-dark/50 bg-gradient-to-b from-white to-coral/10",
    title: "text-coral-dark",
    replay: "border-coral-dark bg-coral text-white hover:bg-coral-dark",
  },
};

export default function TeachModal({
  open,
  title,
  theme,
  onClose,
  onReplay,
  children,
}: TeachModalProps) {
  if (!open) return null;

  const styles = themeStyles[theme];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        aria-label="Close teaching"
        onClick={onClose}
      />

      <div
        className={`animate-bounce-in relative z-10 w-full max-w-lg rounded-3xl border-4 p-5 shadow-2xl md:p-7 ${styles.panel}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className={`text-2xl font-bold md:text-3xl ${styles.title}`}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d rounded-xl border-4 border-ink/15 bg-white px-3 py-1 text-xl font-bold text-ink/60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {children}

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onReplay}
            className={`btn-3d rounded-2xl border-4 px-5 py-2 text-base font-bold md:text-lg ${styles.replay}`}
          >
            🔄 Start over
          </button>
        </div>
      </div>
    </div>
  );
}
