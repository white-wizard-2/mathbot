import { Link } from "react-router-dom";

type GameCompleteProps = {
  score: number;
  totalRounds: number;
  onPlayAgain: () => void;
  emoji: string;
};

export default function GameComplete({
  score,
  totalRounds,
  onPlayAgain,
  emoji,
}: GameCompleteProps) {
  const percentage = Math.round((score / totalRounds) * 100);
  const message =
    percentage === 100
      ? "Perfect score! You're a math champion!"
      : percentage >= 80
        ? "Incredible work! You're a superstar!"
        : percentage >= 60
          ? "Great job! Keep practicing!"
          : "Good try! Play again to get even better!";

  return (
    <div className="animate-bounce-in mx-auto max-w-md rounded-3xl border-4 border-sky-deep bg-white p-8 text-center shadow-xl">
      <span className="animate-star-burst inline-block text-7xl">{emoji}</span>
      <h2 className="mt-4 text-3xl font-bold text-ink">Game Over!</h2>
      <p className="mt-2 text-5xl font-bold text-sunshine-dark">
        {score} / {totalRounds}
      </p>
      <p className="mt-1 text-lg font-medium text-ink/70">stars collected</p>
      <p className="mt-4 text-lg font-semibold text-grass-dark">{message}</p>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="btn-3d rounded-2xl border-4 border-grass-dark bg-grass px-6 py-3 text-xl font-bold text-white"
        >
          Play Again! 🔄
        </button>
        <Link
          to="/"
          className="btn-3d rounded-2xl border-4 border-sky-deep bg-sky-bright px-6 py-3 text-xl font-bold text-white no-underline"
        >
          More Games! 🏠
        </Link>
      </div>
    </div>
  );
}
