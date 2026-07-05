import { useCallback, useMemo, useRef, useState } from "react";
import ScoreBoard from "../components/ScoreBoard";
import GameHintPanel from "../components/GameHintPanel";
import { Confetti } from "../components/Confetti";
import AnswerButton from "../components/AnswerButton";
import GameComplete from "../components/GameComplete";
import { useGameSession } from "../hooks/useGameSession";
import { useQuestionRecording } from "../hooks/useQuestionRecording";
import {
  buildChoices,
  COUNT_OBJECTS,
  pickRandom,
  randomInt,
} from "../lib/utils";

type Round = {
  object: string;
  count: number;
  choices: number[];
};

type VanishLabel = {
  id: number;
  index: number;
  value: number;
};

function createRound(): Round {
  const count = randomInt(1, 10);
  const object = pickRandom(COUNT_OBJECTS);
  const choices = buildChoices(count, 0, 12);

  return { object, count, choices };
}

export default function CountGame() {
  const [round, setRound] = useState<Round>(() => createRound());
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [tappedIndices, setTappedIndices] = useState<Set<number>>(() => new Set());
  const [vanishLabels, setVanishLabels] = useState<VanishLabel[]>([]);
  const labelId = useRef(0);
  const session = useGameSession();
  const questionKey = useMemo(
    () => `${session.round}-${round.count}-${round.object}-${round.choices.join(",")}`,
    [session.round, round.count, round.object, round.choices],
  );
  useQuestionRecording(session, questionKey);

  const resetTapState = useCallback(() => {
    setTappedIndices(new Set());
    setVanishLabels([]);
  }, []);

  const nextRound = useCallback(() => {
    setRound(createRound());
    setWrongPick(null);
    resetTapState();
  }, [resetTapState]);

  const handleObjectTap = (index: number) => {
    if (session.answered || session.hintLoading) return;
    if (tappedIndices.has(index)) return;

    const value = tappedIndices.size + 1;
    const id = labelId.current + 1;
    labelId.current = id;

    setTappedIndices((prev) => new Set(prev).add(index));
    setVanishLabels((prev) => [...prev, { id, index, value }]);

    window.setTimeout(() => {
      setVanishLabels((prev) => prev.filter((label) => label.id !== id));
    }, 900);
  };

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
          🔢 Count Game
        </h1>
        <p className="mt-2 text-lg font-medium text-ink/70">
          Tap each one and count!
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
            const isTapped = tappedIndices.has(index);
            const activeLabels = vanishLabels.filter((label) => label.index === index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleObjectTap(index)}
                disabled={session.answered || session.hintLoading}
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
