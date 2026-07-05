import { useCallback, useState } from "react";
import ScoreBoard from "../components/ScoreBoard";
import FeedbackBanner, { HintBanner } from "../components/FeedbackBanner";
import { Confetti } from "../components/Confetti";
import AnswerButton from "../components/AnswerButton";
import GameComplete from "../components/GameComplete";
import { useGameSession } from "../hooks/useGameSession";
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

function createRound(): Round {
  const count = randomInt(1, 10);
  const object = pickRandom(COUNT_OBJECTS);
  const choices = buildChoices(count, 0, 12);

  return { object, count, choices };
}

export default function CountGame() {
  const [round, setRound] = useState<Round>(() => createRound());
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const session = useGameSession();

  const nextRound = useCallback(() => {
    setRound(createRound());
    setWrongPick(null);
  }, []);

  const handleChoice = (choice: number) => {
    if (session.answered) return;
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
          How many do you see?
        </p>
      </div>

      <ScoreBoard
        score={session.score}
        streak={session.streak}
        round={session.round}
        totalRounds={session.totalRounds}
      />

      {(session.hintLoading || session.hint || session.hintError) && !session.feedback && (
        <HintBanner
          hint={session.hint}
          loading={session.hintLoading}
          error={session.hintError}
          onRetry={session.retryHint}
        />
      )}

      <FeedbackBanner
        type={session.feedback?.type ?? null}
        message={session.feedback?.message ?? ""}
      />

      <div className="mx-auto mb-8 max-w-lg rounded-3xl border-4 border-grass-dark/40 bg-white/80 p-6 shadow-lg backdrop-blur-sm md:p-8">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {Array.from({ length: round.count }, (_, i) => (
            <span
              key={i}
              className="animate-bounce-in inline-block text-4xl md:text-5xl"
              style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
            >
              {round.object}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {round.choices.map((choice) => {
          let variant: "default" | "correct" | "wrong" = "default";
          if (session.answered && choice === round.count) {
            variant = "correct";
          } else if (wrongPick === choice) {
            variant = "wrong";
          }

          return (
            <AnswerButton
              key={choice}
              value={choice}
              onClick={() => handleChoice(choice)}
              disabled={session.answered}
              variant={variant}
            />
          );
        })}
      </div>
    </div>
  );
}
