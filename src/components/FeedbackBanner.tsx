import { pickRandom } from "../lib/utils";

type FeedbackBannerProps = {
  type: "correct" | "wrong" | null;
  message: string;
};

export default function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  if (!type) return null;

  return (
    <div
      className={`animate-bounce-in mb-6 rounded-2xl border-4 px-6 py-4 text-center text-xl font-bold shadow-lg md:text-2xl ${
        type === "correct"
          ? "border-grass-dark bg-grass text-white"
          : "border-coral-dark bg-coral text-white"
      }`}
    >
      <span className="mr-2">{type === "correct" ? "🎉" : "💪"}</span>
      {message}
    </div>
  );
}

export function Confetti() {
  const colors = ["#ffc857", "#ff6b6b", "#7bc043", "#4ec0e9", "#b388ff"];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    color: pickRandom(colors),
    size: randomSize(),
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="animate-confetti absolute top-0 rounded-sm"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}

function randomSize(): number {
  return Math.floor(Math.random() * 10) + 8;
}
