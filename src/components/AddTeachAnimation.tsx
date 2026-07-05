import { useEffect, useMemo, useState } from "react";
import TeachObjectTile, { TeachNextButton, TeachStepDots } from "./TeachObjectTile";

type AddTeachAnimationProps = {
  emoji: string;
  a: number;
  b: number;
  answer: number;
  playKey: number;
};

type AddStep = "first-group" | "second-group" | "count-all" | "done";

const STEPS: AddStep[] = ["first-group", "second-group", "count-all", "done"];

export default function AddTeachAnimation({ emoji, a, b, answer, playKey }: AddTeachAnimationProps) {
  const [step, setStep] = useState<AddStep>("first-group");
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [labels, setLabels] = useState<Map<number, number>>(() => new Map());

  const total = a + b;

  useEffect(() => {
    setStep("first-group");
    setTapped(new Set());
    setLabels(new Map());
  }, [playKey, a, b, answer]);

  const stepIndex = STEPS.indexOf(step);

  const caption = useMemo(() => {
    switch (step) {
      case "first-group":
        return `Step 1: Tap each one in the first group. Count to ${a}!`;
      case "second-group":
        return `Step 2: Tap each one in the second group. Count ${b} more!`;
      case "count-all":
        return `Step 3: Tap every one from the start. Count all the way to ${total}!`;
      case "done":
        return `${a} and ${b} together make ${answer}!`;
    }
  }, [step, a, b, total, answer]);

  const stepComplete =
    step === "first-group"
      ? tapped.size >= a
      : step === "second-group"
        ? [...tapped].filter((index) => index >= a).length >= b
        : step === "count-all"
          ? tapped.size >= total
          : false;

  const handleTap = (index: number) => {
    if (step === "done" || tapped.has(index)) return;

    if (step === "first-group" && index >= a) return;
    if (step === "second-group" && index < a) return;

    const nextCount =
      step === "second-group"
        ? [...tapped].filter((value) => value >= a).length + 1
        : step === "count-all"
          ? tapped.size + 1
          : tapped.size + 1;

    setTapped((prev) => new Set(prev).add(index));
    setLabels((prev) => new Map(prev).set(index, nextCount));
  };

  const nextIndexForStep = (index: number): boolean => {
    if (tapped.has(index)) return false;
    if (step === "first-group") return index === tapped.size && index < a;
    if (step === "second-group") {
      const secondTapped = [...tapped].filter((value) => value >= a).length;
      return index === a + secondTapped && index < a + b;
    }
    if (step === "count-all") return index === tapped.size && index < total;
    return false;
  };

  const goNext = () => {
    if (step === "first-group") {
      setStep("second-group");
      setTapped(new Set());
      setLabels(new Map());
      return;
    }
    if (step === "second-group") {
      setStep("count-all");
      setTapped(new Set());
      setLabels(new Map());
      return;
    }
    if (step === "count-all") {
      setStep("done");
    }
  };

  return (
    <div className="space-y-5">
      <TeachStepDots current={stepIndex} total={STEPS.length - 1} />

      <p className="min-h-[3.5rem] text-center text-lg font-bold leading-snug text-ink md:text-xl">
        {caption}
      </p>

      {step !== "done" && (
        <p className="text-center text-4xl font-bold text-sunshine-dark md:text-5xl">
          {step === "first-group"
            ? `${Math.min(tapped.size, a)} / ${a}`
            : step === "second-group"
              ? `${Math.min([...tapped].filter((index) => index >= a).length, b)} / ${b}`
              : `${Math.min(tapped.size, total)} / ${total}`}
        </p>
      )}

      <div className="space-y-4">
        {step !== "count-all" && step !== "done" && (
          <div
            className={`rounded-3xl border-4 p-4 ${
              step === "first-group"
                ? "border-sunshine-dark/40 bg-sunshine/10"
                : "border-lavender-dark/40 bg-lavender/10"
            }`}
          >
            <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-ink/60 md:text-base">
              {step === "first-group" ? `First group · ${a}` : `Second group · ${b}`}
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {Array.from({ length: step === "first-group" ? a : b }, (_, offset) => {
                const index = step === "first-group" ? offset : a + offset;
                return (
                  <TeachObjectTile
                    key={`${step}-${index}`}
                    emoji={emoji}
                    disabled={stepComplete}
                    isDone={tapped.has(index)}
                    isNext={nextIndexForStep(index)}
                    countLabel={labels.get(index)}
                    accent={step === "first-group" ? "sunshine" : "coral"}
                    onClick={() => handleTap(index)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {(step === "count-all" || step === "done") && (
          <div className="rounded-3xl border-4 border-grass-dark/40 bg-grass/10 p-4">
            <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-ink/60 md:text-base">
              Both groups together
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: a }, (_, index) => (
                  <TeachObjectTile
                    key={`all-a-${index}`}
                    emoji={emoji}
                    disabled={step === "done" || stepComplete}
                    isDone={tapped.has(index) || step === "done"}
                    isNext={step === "count-all" && nextIndexForStep(index)}
                    countLabel={step === "done" ? index + 1 : labels.get(index)}
                    accent="sunshine"
                    onClick={() => handleTap(index)}
                  />
                ))}
              </div>
              <span className="text-3xl font-bold text-sunshine-dark md:text-4xl">+</span>
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: b }, (_, offset) => {
                  const index = a + offset;
                  return (
                    <TeachObjectTile
                      key={`all-b-${index}`}
                      emoji={emoji}
                      disabled={step === "done" || stepComplete}
                      isDone={tapped.has(index) || step === "done"}
                      isNext={step === "count-all" && nextIndexForStep(index)}
                      countLabel={step === "done" ? index + 1 : labels.get(index)}
                      accent="coral"
                      onClick={() => handleTap(index)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-sunshine-dark bg-sunshine text-2xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
              {a}
            </span>
            <span className="text-3xl font-bold text-ink/50 md:text-4xl">+</span>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-coral-dark bg-coral text-2xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
              {b}
            </span>
            <span className="text-3xl font-bold text-ink/50 md:text-4xl">=</span>
            <span className="animate-star-burst flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-grass-dark bg-grass text-3xl font-bold text-white md:h-20 md:w-20 md:text-4xl">
              {answer}
            </span>
          </div>
        )}
      </div>

      {stepComplete && step !== "done" && (
        <div className="flex justify-center pt-2">
          <TeachNextButton
            theme="add"
            label={step === "count-all" ? "See the answer! ✨" : "Next step →"}
            onClick={goNext}
          />
        </div>
      )}
    </div>
  );
}
