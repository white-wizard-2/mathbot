import { useCallback, useState } from "react";
import { ENCOURAGE, PRAISE } from "../lib/utils";
import { pickRandom } from "../lib/utils";

const TOTAL_ROUNDS = 10;
const FEEDBACK_DELAY_MS = 1400;

type FeedbackState = {
  type: "correct" | "wrong";
  message: string;
} | null;

export function useGameSession() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = useCallback(
    (isCorrect: boolean, onNextRound: () => void) => {
      if (answered) return;

      setAnswered(true);

      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        setFeedback({ type: "correct", message: pickRandom(PRAISE) });
        setShowConfetti(true);
      } else {
        setStreak(0);
        setFeedback({ type: "wrong", message: pickRandom(ENCOURAGE) });
      }

      window.setTimeout(() => {
        setFeedback(null);
        setShowConfetti(false);
        setAnswered(false);

        if (round >= TOTAL_ROUNDS) {
          setGameComplete(true);
        } else {
          setRound((r) => r + 1);
          onNextRound();
        }
      }, FEEDBACK_DELAY_MS);
    },
    [answered, round],
  );

  const resetGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setRound(1);
    setFeedback(null);
    setShowConfetti(false);
    setAnswered(false);
    setGameComplete(false);
  }, []);

  return {
    score,
    streak,
    round,
    feedback,
    showConfetti,
    answered,
    gameComplete,
    totalRounds: TOTAL_ROUNDS,
    handleAnswer,
    resetGame,
  };
}
