import { pickRandom } from "../lib/utils";

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
