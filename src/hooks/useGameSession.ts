import { useCallback, useRef, useState } from "react";
import { fetchHint, transcribeAudio } from "../api/hint";
import { RoundRecorder } from "../lib/roundRecorder";
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
  const [hintOpen, setHintOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const lastHintRequest = useRef<HintRequest | null>(null);
  const recorderRef = useRef(new RoundRecorder());
  const hintGeneration = useRef(0);

  const beginQuestion = useCallback(async () => {
    try {
      await recorderRef.current.start();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const requestWrongHint = useCallback(async (hintRequest: HintRequest, audio: Blob | null) => {
    const generation = hintGeneration.current;
    lastHintRequest.current = hintRequest;
    setHintOpen(true);
    setHintError(null);
    setHint(null);
    setHintLoading(true);

    let spokenText: string | undefined;

    if (audio) {
      try {
        spokenText = await transcribeAudio(audio);
      } catch {
        spokenText = undefined;
      }
    }

    if (generation !== hintGeneration.current) return;

    try {
      const payload = spokenText ? { ...hintRequest, spokenText } : hintRequest;
      lastHintRequest.current = payload;
      const message = await fetchHint(payload);
      if (generation !== hintGeneration.current) return;
      setHint(message);
      speak(message);
    } catch (error) {
      if (generation !== hintGeneration.current) return;
      const detail = error instanceof Error ? error.message : "Could not reach MathBot";
      setHint(null);
      setHintError(detail);
    } finally {
      if (generation === hintGeneration.current) {
        setHintLoading(false);
        void beginQuestion();
      }
    }
  }, [beginQuestion]);

  const retryHint = useCallback(() => {
    if (lastHintRequest.current) {
      hintGeneration.current += 1;
      void requestWrongHint(lastHintRequest.current, null);
    }
  }, [requestWrongHint]);

  const handleAnswer = useCallback(
    (isCorrect: boolean, { onNextRound, hintRequest }: HandleAnswerOptions) => {
      if (answered) return;

      void (async () => {
        let audio: Blob | null = null;
        try {
          audio = await recorderRef.current.stop();
        } catch (error) {
          console.error(error);
        }

        if (isCorrect) {
          hintGeneration.current += 1;
          stopSpeech();
          setHint(null);
          setHintError(null);
          setHintLoading(false);
          setHintOpen(false);
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
          setHintLoading(true);
          hintGeneration.current += 1;
          await requestWrongHint(hintRequest, audio);
        }
      })();
    },
    [answered, round, requestWrongHint],
  );

  const resetGame = useCallback(() => {
    hintGeneration.current += 1;
    recorderRef.current.cancel();
    stopSpeech();
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
  }, []);

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
    beginQuestion,
    handleAnswer,
    retryHint,
    resetGame,
  };
}
