import { useEffect } from "react";
import type { useGameSession } from "./useGameSession";

export function useQuestionRecording(
  session: ReturnType<typeof useGameSession>,
  questionKey: string,
) {
  const { beginQuestion, round } = session;

  useEffect(() => {
    void beginQuestion();
  }, [questionKey, round, beginQuestion]);
}
