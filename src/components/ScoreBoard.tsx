type ScoreBoardProps = {
  score: number;
  streak: number;
  round: number;
  totalRounds: number;
};

export default function ScoreBoard({ score, streak, round, totalRounds }: ScoreBoardProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-3 md:gap-6">
      <div className="rounded-2xl border-4 border-sunshine-dark bg-sunshine px-5 py-2 text-center shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-sunshine-dark">
          Stars
        </p>
        <p className="text-2xl font-bold text-ink">
          {"⭐".repeat(Math.min(score, 10))}
          {score > 10 && ` +${score - 10}`}
          {score === 0 && "—"}
        </p>
      </div>

      <div className="rounded-2xl border-4 border-grass-dark bg-grass px-5 py-2 text-center shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-grass-dark">
          Streak
        </p>
        <p className="text-2xl font-bold text-white">
          {streak > 0 ? `🔥 ${streak}` : "—"}
        </p>
      </div>

      <div className="rounded-2xl border-4 border-lavender-dark bg-lavender px-5 py-2 text-center shadow-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-lavender-dark">
          Round
        </p>
        <p className="text-2xl font-bold text-white">
          {round} / {totalRounds}
        </p>
      </div>
    </div>
  );
}
