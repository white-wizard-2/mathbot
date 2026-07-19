import { useCallback, useState } from "react";
import ScoreBoard from "../components/ScoreBoard";
import GameHintPanel from "../components/GameHintPanel";
import { DivideObjectPanel } from "../components/GameObjectPanel";
import DivideTeachAnimation from "../components/DivideTeachAnimation";
import TeachModal from "../components/TeachModal";
import { Confetti } from "../components/Confetti";
import AnswerButton from "../components/AnswerButton";
import GameComplete from "../components/GameComplete";
import { useGameSession } from "../hooks/useGameSession";
import { useTapCount } from "../hooks/useTapCount";
import { createDivideRound } from "../lib/utils";
import { stopSpeech } from "../lib/speech";

type Round = ReturnType<typeof createDivideRound>;

export default function DivideGame() {
  const [round, setRound] = useState<Round>(() => createDivideRound());
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [teachPlayKey, setTeachPlayKey] = useState(0);
  const [highlightAnswer, setHighlightAnswer] = useState(false);
  const tapCount = useTapCount();
  const session = useGameSession();

  const openTeach = useCallback(() => {
    stopSpeech();
    setShowTeachModal(true);
    setTeachPlayKey((key) => key + 1);
  }, []);

  const resetRoundState = useCallback(() => {
    setWrongPick(null);
    setShowTeachModal(false);
    setHighlightAnswer(false);
    tapCount.reset();
  }, [tapCount]);

  const nextRound = useCallback(() => {
    setRound(createDivideRound());
    resetRoundState();
  }, [resetRoundState]);

  const handleChoice = (choice: number) => {
    if (session.answered || session.hintLoading) return;
    const isCorrect = choice === round.answer;
    if (!isCorrect) {
      setWrongPick(choice);
      setHighlightAnswer(false);
    }
    session.handleAnswer(isCorrect, {
      onNextRound: nextRound,
      hintRequest: {
        game: "divide",
        total: round.total,
        groups: round.groups,
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
        emoji="➗"
      />
    );
  }

  return (
    <div>
      {session.showConfetti && <Confetti />}

      <TeachModal
        open={showTeachModal}
        title="➗ Share equally!"
        theme="divide"
        onClose={() => {
          setShowTeachModal(false);
          setHighlightAnswer(true);
        }}
        onReplay={() => setTeachPlayKey((key) => key + 1)}
      >
        <DivideTeachAnimation
          emoji={round.emoji}
          total={round.total}
          groups={round.groups}
          answer={round.answer}
          playKey={teachPlayKey}
        />
      </TeachModal>

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-sky-deep md:text-4xl">
          ➗ Share
        </h1>
        <p className="mt-2 text-lg font-medium text-ink/70">
          How many in each group?
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
        <p className="text-center text-2xl font-bold text-sky-deep md:text-3xl">
          {round.total} ÷ {round.groups} = ?
        </p>

        <DivideObjectPanel
          emoji={round.emoji}
          total={round.total}
          groups={round.groups}
          each={round.answer}
          disabled={tapDisabled}
          tapped={tapCount.tapped}
          labels={tapCount.labels}
          onTap={(index) => {
            if (index >= round.answer) return;
            tapCount.handleTap(index, tapDisabled);
          }}
        />

        {wrongPick !== null && (
          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={openTeach}
              className="btn-3d animate-teach-pulse rounded-2xl border-4 border-sky-deep bg-sky-bright px-6 py-3 text-lg font-bold text-white md:text-xl"
            >
              📚 Show me how
            </button>
            {highlightAnswer && (
              <p className="text-base font-bold text-grass-dark md:text-lg">
                Now tap the number!
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {round.choices.map((choice) => {
          let variant: "default" | "correct" | "wrong" | "highlight" = "default";
          if (session.feedback && choice === round.answer) {
            variant = "correct";
          } else if (wrongPick === choice) {
            variant = "wrong";
          } else if (highlightAnswer && choice === round.answer) {
            variant = "highlight";
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
