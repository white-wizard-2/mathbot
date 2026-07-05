import type { useGameSession } from "../hooks/useGameSession";
import FeedbackBanner, { HintBanner } from "./FeedbackBanner";

type GameHintPanelProps = {
  session: ReturnType<typeof useGameSession>;
};

export default function GameHintPanel({ session }: GameHintPanelProps) {
  const showPanel =
    session.hintOpen &&
    !session.feedback &&
    (session.hintLoading || session.hint || session.hintError);

  return (
    <>
      {showPanel && (
        <HintBanner
          hint={session.hint}
          loading={session.hintLoading}
          loadingLabel="Thinking"
          error={session.hintError}
          onRetry={session.retryHint}
        />
      )}

      <FeedbackBanner
        type={session.feedback?.type ?? null}
        message={session.feedback?.message ?? ""}
      />
    </>
  );
}
