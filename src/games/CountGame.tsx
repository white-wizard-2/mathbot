import { useCallback, useState } from "react";
import ScoreBoard from "../components/ScoreBoard";
import GameHintPanel from "../components/GameHintPanel";
import { Confetti } from "../components/Confetti";
import AnswerButton from "../components/AnswerButton";
import GameComplete from "../components/GameComplete";
import { useGameSession } from "../hooks/useGameSession";
import { useTapCount } from "../hooks/useTapCount";
import { createCountRound } from "../lib/utils";

type Round = ReturnType<typeof createCountRound>;

export default function CountGame() {
  const [round, setRound] = useState<Round>(() => createCountRound());
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const tapCount = useTapCount();
  const session = useGameSession();

  const resetRoundState = useCallback(() => {
    setWrongPick(null);
    tapCount.reset();
  }, [tapCount]);

  const nextRound = useCallback(() => {
    setRound(createCountRound());
    resetRoundState();
  }, [resetRoundState]);

  const tapDisabled = session.answered || session.hintLoading;

  const handleChoice = (choice: number) => {
    if (session.answered || session.hintLoading) return;
    const isCorrect = choice === round.count;
    if (!isCorrect) {
      setWrongPick(choice);
    }
    session.handleAnswer(isCorrect, {
      onNextRound: nextRound,
      hintRequest: {
        game: "count",
        object: round.object,
        picked: choice,
        total: round.count,
      },
    });
  };

  if (session.gameComplete) {
    return (
      <GameComplete
        score={session.score}
        totalRounds={session.totalRounds}
        onPlayAgain={() => {
          session.resetGame();
          nextRound();
        }}
        emoji="🔢"
      />
    );
  }

  return (
    <div>
      {session.showConfetti && <Confetti />}

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-grass-dark md:text-4xl">
          🔢 Count
        </h1>
        <p className="mt-2 text-lg font-medium text-ink/70">
          Tap each one. How many?
        </p>
      </div>

      <ScoreBoard
        score={session.score}
        streak={session.streak}
        round={session.round}
        totalRounds={session.totalRounds}
      />

      <GameHintPanel session={session} />

      <div className="mx-auto mb-8 max-w-lg rounded-3xl border-4 border-grass-dark/40 bg-white/80 p-6 shadow-lg backdrop-blur-sm md:p-8">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {Array.from({ length: round.count }, (_, index) => {
            const isTapped = tapCount.tapped.has(index);
            const activeLabels = tapCount.labels.filter((label) => label.index === index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => tapCount.handleTap(index, tapDisabled)}
                disabled={tapDisabled}
                className={`animate-bounce-in relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border-4 text-4xl transition md:h-20 md:w-20 md:text-5xl ${
                  isTapped
                    ? "border-grass bg-grass/20 scale-95"
                    : "border-grass-dark/30 bg-white hover:scale-105 active:scale-95"
                } disabled:opacity-60`}
                style={{ animationDelay: `${index * 60}ms` }}
                aria-label={`Object ${index + 1}`}
              >
                {round.object}
                {activeLabels.map((label) => (
                  <span
                    key={label.id}
                    className="animate-count-vanish pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 text-2xl font-bold text-grass-dark drop-shadow-sm md:text-3xl"
                  >
                    {label.value}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {round.choices.map((choice) => {
          let variant: "default" | "correct" | "wrong" = "default";
          if (session.feedback && choice === round.count) {
            variant = "correct";
          } else if (wrongPick === choice) {
            variant = "wrong";
          }

          return (
            <AnswerButton
              key={choice}
              value={choice}
              onClick={() => handleChoice(choice)}
              disabled={session.answered || session.hintLoading}
              variant={variant}
            />
          );
        })}
      </div>
    </div>
  );
}
