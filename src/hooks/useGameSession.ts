import { useCallback, useRef, useState } from "react";
import { fetchHint } from "../api/hint";
import { AGE } from "../lib/ageConfig";
import { PRAISE, pickRandom } from "../lib/utils";
import { speak, stopSpeech } from "../lib/speech";
import type { HintRequest } from "../types/hint";

const TOTAL_ROUNDS = AGE.totalRounds;
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
  const [hintOpen, setHintOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const lastHintRequest = useRef<HintRequest | null>(null);
  const lastHintMessage = useRef<string | null>(null);
  const wrongAttemptsOnQuestion = useRef<number[]>([]);
  const hintGeneration = useRef(0);

  const clearQuestionMistakes = useCallback(() => {
    lastHintMessage.current = null;
    wrongAttemptsOnQuestion.current = [];
  }, []);

  const requestWrongHint = useCallback(async (
    hintRequest: HintRequest,
    options?: { skipAttemptRecord?: boolean },
  ) => {
    const generation = hintGeneration.current;
    const picked = hintRequest.picked;
    const isRepeatMistake = wrongAttemptsOnQuestion.current.includes(picked);

    if (!options?.skipAttemptRecord) {
      wrongAttemptsOnQuestion.current.push(picked);
    }

    setHintOpen(true);
    setHintError(null);
    setHint(null);
    setHintLoading(true);

    try {
      const payload: HintRequest = {
        ...hintRequest,
        previousHint: lastHintMessage.current ?? undefined,
        isRepeatMistake,
        wrongAttempts: [...wrongAttemptsOnQuestion.current],
      };
      lastHintRequest.current = payload;
      const message = await fetchHint(payload);
      if (generation !== hintGeneration.current) return;
      lastHintMessage.current = message;
      setHint(message);
      speak(message, { mode: "hint" });
    } catch (error) {
      if (generation !== hintGeneration.current) return;
      const detail = error instanceof Error ? error.message : "Could not reach MathBot";
      setHint(null);
      setHintError(detail);
    } finally {
      if (generation === hintGeneration.current) {
        setHintLoading(false);
      }
    }
  }, []);

  const retryHint = useCallback(() => {
    if (lastHintRequest.current) {
      hintGeneration.current += 1;
      void requestWrongHint(lastHintRequest.current, { skipAttemptRecord: true });
    }
  }, [requestWrongHint]);

  const handleAnswer = useCallback(
    (isCorrect: boolean, { onNextRound, hintRequest }: HandleAnswerOptions) => {
      if (answered) return;

      if (isCorrect) {
        hintGeneration.current += 1;
        stopSpeech();
        setHint(null);
        setHintError(null);
        setHintLoading(false);
        setHintOpen(false);
        clearQuestionMistakes();
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        const praise = pickRandom(PRAISE);
        setFeedback({ type: "correct", message: praise });
        speak(praise, { mode: "praise" });
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
        hintGeneration.current += 1;
        void requestWrongHint(hintRequest);
      }
    },
    [answered, round, requestWrongHint, clearQuestionMistakes],
  );

  const resetGame = useCallback(() => {
    hintGeneration.current += 1;
    stopSpeech();
    clearQuestionMistakes();
    setScore(0);
    setStreak(0);
    setRound(1);
    setFeedback(null);
    setHint(null);
    setHintLoading(false);
    setHintError(null);
    setHintOpen(false);
    setShowConfetti(false);
    setAnswered(false);
    setGameComplete(false);
    lastHintRequest.current = null;
  }, [clearQuestionMistakes]);

  return {
    score,
    streak,
    round,
    feedback,
    hint,
    hintLoading,
    hintError,
    hintOpen,
    showConfetti,
    answered,
    gameComplete,
    totalRounds: TOTAL_ROUNDS,
    handleAnswer,
    retryHint,
    resetGame,
  };
}
