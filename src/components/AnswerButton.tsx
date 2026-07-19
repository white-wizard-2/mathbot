type AnswerButtonProps = {
  value: number | string;
  onClick: () => void;
  disabled: boolean;
  variant?: "default" | "correct" | "wrong" | "highlight";
};

export default function AnswerButton({
  value,
  onClick,
  disabled,
  variant = "default",
}: AnswerButtonProps) {
  const base =
    "btn-3d min-h-[72px] min-w-[72px] rounded-2xl border-4 text-3xl font-bold transition md:min-h-[88px] md:min-w-[88px] md:text-4xl";

  const variants = {
    default: "border-sky-deep bg-white text-ink hover:bg-sky-bright/20",
    correct: "border-grass-dark bg-grass text-white",
    wrong: "border-coral-dark bg-coral text-white",
    highlight: "animate-teach-pulse border-grass-dark bg-grass/20 text-grass-dark ring-4 ring-grass/40",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
    >
      {value}
    </button>
  );
}
