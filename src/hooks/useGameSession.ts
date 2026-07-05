import { useCallback, useRef, useState } from "react";
import { fetchHint } from "../api/hint";
import { PRAISE, pickRandom } from "../lib/utils";
import { speak, stopSpeech } from "../lib/speech";
import type { HintRequest } from "../types/hint";

const TOTAL_ROUNDS = 10;
const CORRECT_DELAY_MS = 1400;

type FeedbackState = {
  type: "correct";
  message: string;
} | null;

type HandleAnswerOptions = {
  onNextRound: () => void;
  hintRequest: HintRequest;
};

export function useGameSession() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const lastHintRequest = useRef<HintRequest | null>(null);

  const requestHint = useCallback(async (payload: HintRequest) => {
    lastHintRequest.current = payload;
    setHintLoading(true);
    setHintError(null);

    try {
      const message = await fetchHint(payload);
      setHint(message);
      speak(message);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not reach MathBot";
      setHint(null);
      setHintError(detail);
    } finally {
      setHintLoading(false);
    }
  }, []);

  const retryHint = useCallback(() => {
    if (lastHintRequest.current) {
      void requestHint(lastHintRequest.current);
    }
  }, [requestHint]);

  const handleAnswer = useCallback(
    (isCorrect: boolean, { onNextRound, hintRequest }: HandleAnswerOptions) => {
      if (answered) return;

      if (isCorrect) {
        stopSpeech();
        setHint(null);
        setHintError(null);
        setHintLoading(false);
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        const praise = pickRandom(PRAISE);
        setFeedback({ type: "correct", message: praise });
        speak(praise);
        setShowConfetti(true);
        setAnswered(true);

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
        }, CORRECT_DELAY_MS);
      } else {
        setStreak(0);
        void requestHint(hintRequest);
      }
    },
    [answered, round, requestHint],
  );

  const resetGame = useCallback(() => {
    stopSpeech();
    setScore(0);
    setStreak(0);
    setRound(1);
    setFeedback(null);
    setHint(null);
    setHintLoading(false);
    setHintError(null);
    setShowConfetti(false);
    setAnswered(false);
    setGameComplete(false);
    lastHintRequest.current = null;
  }, []);

  return {
    score,
    streak,
    round,
    feedback,
    hint,
    hintLoading,
    hintError,
    showConfetti,
    answered,
    gameComplete,
    totalRounds: TOTAL_ROUNDS,
    handleAnswer,
    retryHint,
    resetGame,
  };
}
