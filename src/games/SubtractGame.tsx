import { useCallback, useMemo, useState } from "react";
import ScoreBoard from "../components/ScoreBoard";
import GameHintPanel from "../components/GameHintPanel";
import { SubtractVisualHelper } from "../components/MathVisualHelper";
import { Confetti } from "../components/Confetti";
import AnswerButton from "../components/AnswerButton";
import GameComplete from "../components/GameComplete";
import { useGameSession } from "../hooks/useGameSession";
import { useQuestionRecording } from "../hooks/useQuestionRecording";
import { useSubtractTapCount } from "../hooks/useVanishTapCount";
import { buildChoices, COUNT_OBJECTS, pickRandom, randomInt } from "../lib/utils";

type Round = {
  a: number;
  b: number;
  answer: number;
  choices: number[];
  emoji: string;
};

function createRound(): Round {
  const a = randomInt(2, 10);
  const b = randomInt(1, a);
  const answer = a - b;
  const choices = buildChoices(answer, 0, 10);

  return { a, b, answer, choices, emoji: pickRandom(COUNT_OBJECTS) };
}

export default function SubtractGame() {
  const [round, setRound] = useState<Round>(() => createRound());
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [showVisualHelper, setShowVisualHelper] = useState(false);
  const tapCount = useSubtractTapCount(round.b);
  const session = useGameSession();
  const questionKey = useMemo(
    () => `${session.round}-${round.a}-${round.b}-${round.choices.join(",")}`,
    [session.round, round.a, round.b, round.choices],
  );
  useQuestionRecording(session, questionKey);

  const resetRoundState = useCallback(() => {
    setWrongPick(null);
    setShowVisualHelper(false);
    tapCount.reset();
  }, [tapCount]);

  const nextRound = useCallback(() => {
    setRound(createRound());
    resetRoundState();
  }, [resetRoundState]);

  const handleChoice = (choice: number) => {
    if (session.answered || session.hintLoading) return;
    const isCorrect = choice === round.answer;
    if (!isCorrect) {
      setWrongPick(choice);
      setShowVisualHelper(true);
    }
    session.handleAnswer(isCorrect, {
      onNextRound: nextRound,
      hintRequest: {
        game: "subtract",
        a: round.a,
        b: round.b,
        picked: choice,
      },
    });
  };

  const tapDisabled = session.answered || session.hintLoading;

  if (session.gameComplete) {
    return (
      <GameComplete
        score={session.score}
        totalRounds={session.totalRounds}
        onPlayAgain={() => {
          session.resetGame();
          nextRound();
        }}
        emoji="➖"
      />
    );
  }

  return (
    <div>
      {session.showConfetti && <Confetti />}

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-coral-dark md:text-4xl">
          ➖ Subtract Game
        </h1>
        <p className="mt-2 text-lg font-medium text-ink/70">
          Take some away — what&apos;s left?
        </p>
      </div>

      <ScoreBoard
        score={session.score}
        streak={session.streak}
        round={session.round}
        totalRounds={session.totalRounds}
      />

      <GameHintPanel session={session} />

      <div className="mx-auto mb-4 max-w-lg">
        <div className="flex items-center justify-center gap-4 md:gap-6">
          <div className="animate-bounce-in flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-coral-dark bg-coral text-5xl font-bold text-white shadow-lg md:h-28 md:w-28 md:text-6xl">
            {round.a}
          </div>
          <span className="text-5xl font-bold text-coral-dark md:text-6xl">−</span>
          <div
            className="animate-bounce-in flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-coral-dark bg-coral text-5xl font-bold text-white shadow-lg md:h-28 md:w-28 md:text-6xl"
            style={{ animationDelay: "100ms", opacity: 0 }}
          >
            {round.b}
          </div>
          <span className="text-5xl font-bold text-ink/40 md:text-6xl">=</span>
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-dashed border-coral-dark/50 bg-white/60 text-5xl font-bold text-ink/30 md:h-28 md:w-28 md:text-6xl">
            ?
          </div>
        </div>

        {showVisualHelper && (
          <SubtractVisualHelper
            emoji={round.emoji}
            total={round.a}
            takeAway={round.b}
            disabled={tapDisabled}
            removedIndices={tapCount.removedIndices}
            countedIndices={tapCount.countedIndices}
            vanishLabels={tapCount.vanishLabels}
            onTap={(index) => tapCount.handleTap(index, tapDisabled)}
          />
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {round.choices.map((choice) => {
          let variant: "default" | "correct" | "wrong" = "default";
          if (session.feedback && choice === round.answer) {
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
