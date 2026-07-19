import { useEffect, useMemo, useState } from "react";
import TeachObjectTile, { TeachNextButton, TeachStepDots } from "./TeachObjectTile";

type DivideTeachAnimationProps = {
  emoji: string;
  total: number;
  groups: number;
  answer: number;
  playKey: number;
};

type DivideStep = "see-all" | "count-group" | "done";

const STEPS: DivideStep[] = ["see-all", "count-group", "done"];

export default function DivideTeachAnimation({
  emoji,
  total,
  groups,
  answer,
  playKey,
}: DivideTeachAnimationProps) {
  const [step, setStep] = useState<DivideStep>("see-all");
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [labels, setLabels] = useState<Map<number, number>>(() => new Map());

  useEffect(() => {
    setStep("see-all");
    setTapped(new Set());
    setLabels(new Map());
  }, [playKey, total, groups, answer]);

  const stepIndex = STEPS.indexOf(step);

  const caption = useMemo(() => {
    switch (step) {
      case "see-all":
        return `${total} shared into ${groups} groups. Tap Ready!`;
      case "count-group":
        return `Tap one group. Count them!`;
      case "done":
        return `${answer} in each group!`;
    }
  }, [step, total, groups, answer]);

  const stepComplete = step === "see-all" ? true : tapped.size >= answer;

  const handleTap = (index: number) => {
    if (step !== "count-group" || index >= answer || tapped.has(index)) return;
    const nextCount = tapped.size + 1;
    setTapped((prev) => new Set(prev).add(index));
    setLabels((prev) => new Map(prev).set(index, nextCount));
  };

  const nextCountable = (index: number): boolean => {
    if (index >= answer || tapped.has(index)) return false;
    return index === tapped.size;
  };

  const goNext = () => {
    if (step === "see-all") {
      setStep("count-group");
      return;
    }
    if (step === "count-group") {
      setStep("done");
    }
  };

  return (
    <div className="space-y-5">
      <TeachStepDots current={stepIndex} total={STEPS.length - 1} />

      <p className="min-h-[3.5rem] text-center text-lg font-bold leading-snug text-ink md:text-xl">
        {caption}
      </p>

      {step === "count-group" && (
        <p className="text-center text-4xl font-bold text-sky-deep md:text-5xl">
          {tapped.size} / {answer}
        </p>
      )}

      <div className="rounded-3xl border-4 border-sky-deep/40 bg-sky-bright/10 p-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: groups }, (_, groupIndex) => {
            const start = groupIndex * answer;
            const isFirstGroup = groupIndex === 0;
            return (
              <div
                key={groupIndex}
                className={`flex flex-wrap justify-center gap-2 rounded-2xl border-4 p-2 ${
                  isFirstGroup && step !== "see-all"
                    ? "border-sky-deep/50 bg-sky-bright/15"
                    : "border-ink/10 bg-white/50"
                }`}
              >
                {Array.from({ length: answer }, (_, offset) => {
                  const index = start + offset;
                  const isActiveGroup = groupIndex === 0;
                  return (
                    <TeachObjectTile
                      key={index}
                      emoji={emoji}
                      disabled={
                        step === "see-all" ||
                        step === "done" ||
                        !isActiveGroup ||
                        stepComplete ||
                        tapped.has(index)
                      }
                      isDone={tapped.has(index) || step === "done"}
                      isRemoved={!isActiveGroup && step === "count-group"}
                      isNext={step === "count-group" && isActiveGroup && nextCountable(index)}
                      countLabel={step === "done" && isActiveGroup ? offset + 1 : labels.get(index)}
                      accent="sky"
                      onClick={() => handleTap(index)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {step === "done" && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-sky-deep bg-sky-bright text-2xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
            {total}
          </span>
          <span className="text-3xl font-bold text-ink/50">÷</span>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-sky-deep bg-sky-bright text-2xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
            {groups}
          </span>
          <span className="text-3xl font-bold text-ink/50">=</span>
          <span className="animate-star-burst flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-grass-dark bg-grass text-3xl font-bold text-white md:h-20 md:w-20 md:text-4xl">
            {answer}
          </span>
        </div>
      )}

      {step === "see-all" && (
        <div className="flex justify-center pt-2">
          <TeachNextButton theme="divide" label="Ready! →" onClick={goNext} />
        </div>
      )}

      {stepComplete && step === "count-group" && (
        <div className="flex justify-center pt-2">
          <TeachNextButton theme="divide" label="See answer! ✨" onClick={goNext} />
        </div>
      )}
    </div>
  );
}
