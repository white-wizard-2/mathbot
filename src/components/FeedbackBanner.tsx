type FeedbackBannerProps = {
  type: "correct" | null;
  message: string;
};

export default function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  if (!type) return null;

  return (
    <div className="animate-bounce-in mb-6 rounded-2xl border-4 border-grass-dark bg-grass px-6 py-4 text-center text-white shadow-lg">
      <p className="text-2xl font-bold md:text-3xl">
        <span className="mr-2">🎉</span>
        {message}
      </p>
    </div>
  );
}

type HintBannerProps = {
  hint: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function HintBanner({ hint, loading, error, onRetry }: HintBannerProps) {
  if (!loading && !hint && !error) return null;

  return (
    <div className="mb-6 rounded-2xl border-4 border-sunshine-dark bg-sunshine px-5 py-4 text-center text-ink shadow-lg">
      <p className="text-lg font-bold">
        <span className="mr-1 animate-wiggle inline-block">🤖</span>
        MathBot
      </p>

      {loading && (
        <p className="mt-2 text-base font-semibold">
          Thinking<span className="animate-pulse">...</span>
        </p>
      )}

      {!loading && hint && (
        <p className="mt-2 text-xl font-bold leading-tight md:text-2xl">{hint}</p>
      )}

      {!loading && error && (
        <div className="mt-2">
          <p className="text-sm font-semibold text-coral-dark">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="btn-3d mt-3 rounded-xl border-4 border-sky-deep bg-sky-bright px-4 py-1.5 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && hint && (
        <p className="mt-2 text-sm font-bold text-sunshine-dark">Try again!</p>
      )}
    </div>
  );
}
