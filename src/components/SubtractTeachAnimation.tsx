import { useEffect, useMemo, useState } from "react";
import TeachObjectTile, { TeachNextButton, TeachStepDots } from "./TeachObjectTile";

type SubtractTeachAnimationProps = {
  emoji: string;
  total: number;
  takeAway: number;
  answer: number;
  playKey: number;
};

type SubtractStep = "see-all" | "take-away" | "count-left" | "done";

const STEPS: SubtractStep[] = ["see-all", "take-away", "count-left", "done"];

export default function SubtractTeachAnimation({
  emoji,
  total,
  takeAway,
  answer,
  playKey,
}: SubtractTeachAnimationProps) {
  const [step, setStep] = useState<SubtractStep>("see-all");
  const [removed, setRemoved] = useState<Set<number>>(() => new Set());
  const [counted, setCounted] = useState<Set<number>>(() => new Set());
  const [labels, setLabels] = useState<Map<number, number>>(() => new Map());

  useEffect(() => {
    setStep("see-all");
    setRemoved(new Set());
    setCounted(new Set());
    setLabels(new Map());
  }, [playKey, total, takeAway, answer]);

  const stepIndex = STEPS.indexOf(step);

  const caption = useMemo(() => {
    switch (step) {
      case "see-all":
        return `Look! ${total} here. Tap Ready!`;
      case "take-away":
        return `Tap ${takeAway} to take away!`;
      case "count-left":
        return `Tap what's left. Count them!`;
      case "done":
        return `${answer} left!`;
    }
  }, [step, total, takeAway, answer]);

  const leftIndices = useMemo(
    () =>
      Array.from({ length: total }, (_, index) => index).filter((index) => !removed.has(index)),
    [total, removed],
  );

  const stepComplete =
    step === "see-all"
      ? true
      : step === "take-away"
        ? removed.size >= takeAway
        : step === "count-left"
          ? counted.size >= answer
          : false;

  const handleRemove = (index: number) => {
    if (step !== "take-away" || removed.has(index)) return;
    setRemoved((prev) => new Set(prev).add(index));
  };

  const handleCount = (index: number) => {
    if (step !== "count-left" || removed.has(index) || counted.has(index)) return;
    const nextCount = counted.size + 1;
    setCounted((prev) => new Set(prev).add(index));
    setLabels((prev) => new Map(prev).set(index, nextCount));
  };

  const nextCountable = (index: number): boolean => {
    if (removed.has(index) || counted.has(index)) return false;
    const order = leftIndices.filter((value) => !counted.has(value));
    return order[0] === index;
  };

  const goNext = () => {
    if (step === "see-all") {
      setStep("take-away");
      return;
    }
    if (step === "take-away") {
      setStep("count-left");
      setCounted(new Set());
      setLabels(new Map());
      return;
    }
    if (step === "count-left") {
      setStep("done");
    }
  };

  return (
    <div className="space-y-5">
      <TeachStepDots current={stepIndex} total={STEPS.length - 1} />

      <p className="min-h-[3.5rem] text-center text-lg font-bold leading-snug text-ink md:text-xl">
        {caption}
      </p>

      {step === "take-away" && (
        <p className="text-center text-4xl font-bold text-coral-dark md:text-5xl">
          {removed.size} / {takeAway} away
        </p>
      )}

      {step === "count-left" && (
        <p className="text-center text-4xl font-bold text-grass-dark md:text-5xl">
          {counted.size} / {answer}
        </p>
      )}

      <div className="rounded-3xl border-4 border-coral-dark/40 bg-coral/10 p-4">
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {Array.from({ length: total }, (_, index) => {
            const isRemoved = removed.has(index);
            const isCounted = counted.has(index);

            if (step === "see-all") {
              return (
                <TeachObjectTile
                  key={index}
                  emoji={emoji}
                  disabled
                  isDone={false}
                  accent="coral"
                  onClick={() => {}}
                />
              );
            }

            if (step === "take-away") {
              return (
                <TeachObjectTile
                  key={index}
                  emoji={emoji}
                  disabled={stepComplete || isRemoved}
                  isDone={isRemoved}
                  isRemoved={isRemoved}
                  isNext={false}
                  accent="coral"
                  onClick={() => handleRemove(index)}
                />
              );
            }

            if (step === "count-left") {
              return (
                <TeachObjectTile
                  key={index}
                  emoji={emoji}
                  disabled={isRemoved || stepComplete || isCounted}
                  isDone={isCounted}
                  isRemoved={isRemoved}
                  isNext={nextCountable(index)}
                  countLabel={labels.get(index)}
                  accent="grass"
                  onClick={() => handleCount(index)}
                />
              );
            }

            return (
              <TeachObjectTile
                key={index}
                emoji={emoji}
                disabled
                isDone={!isRemoved}
                isRemoved={isRemoved}
                countLabel={!isRemoved ? leftIndices.indexOf(index) + 1 : undefined}
                accent="grass"
                onClick={() => {}}
              />
            );
          })}
        </div>
      </div>

      {step === "done" && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-coral-dark bg-coral text-2xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
            {total}
          </span>
          <span className="text-3xl font-bold text-ink/50 md:text-4xl">−</span>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-coral-dark/70 bg-coral/80 text-2xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
            {takeAway}
          </span>
          <span className="text-3xl font-bold text-ink/50 md:text-4xl">=</span>
          <span className="animate-star-burst flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-grass-dark bg-grass text-3xl font-bold text-white md:h-20 md:w-20 md:text-4xl">
            {answer}
          </span>
        </div>
      )}

      {step === "see-all" && (
        <div className="flex justify-center pt-2">
          <TeachNextButton theme="subtract" label="Ready! →" onClick={goNext} />
        </div>
      )}

      {stepComplete && step !== "see-all" && step !== "done" && (
        <div className="flex justify-center pt-2">
          <TeachNextButton
            theme="subtract"
            label={step === "count-left" ? "See answer! ✨" : "Count left →"}
            onClick={goNext}
          />
        </div>
      )}
    </div>
  );
}
