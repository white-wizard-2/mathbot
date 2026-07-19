import { useEffect, useMemo, useState } from "react";
import TeachObjectTile, { TeachNextButton, TeachStepDots } from "./TeachObjectTile";

type MultiplyTeachAnimationProps = {
  emoji: string;
  groups: number;
  each: number;
  answer: number;
  playKey: number;
};

const GROUP_ACCENTS = ["sunshine", "lavender", "grass"] as const;

type MultiplyStep = "group" | "count-all" | "done";

export default function MultiplyTeachAnimation({
  emoji,
  groups,
  each,
  answer,
  playKey,
}: MultiplyTeachAnimationProps) {
  const [step, setStep] = useState<MultiplyStep>("group");
  const [groupIndex, setGroupIndex] = useState(0);
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [labels, setLabels] = useState<Map<number, number>>(() => new Map());

  const total = groups * each;
  const totalSteps = groups + 1;

  useEffect(() => {
    setStep("group");
    setGroupIndex(0);
    setTapped(new Set());
    setLabels(new Map());
  }, [playKey, groups, each, answer]);

  const stepIndex =
    step === "group" ? groupIndex : step === "count-all" ? groups : groups + 1;

  const caption = useMemo(() => {
    if (step === "group") {
      return `Tap this group! Count to ${each}.`;
    }
    if (step === "count-all") {
      return `Tap every one! Count to ${total}.`;
    }
    return `${groups} groups of ${each} — ${answer}!`;
  }, [step, groups, each, total, answer]);

  const groupStart = groupIndex * each;
  const groupTapped = [...tapped].filter(
    (index) => index >= groupStart && index < groupStart + each,
  ).length;

  const stepComplete =
    step === "group"
      ? groupTapped >= each
      : step === "count-all"
        ? tapped.size >= total
        : false;

  const handleTap = (index: number) => {
    if (step === "done" || tapped.has(index)) return;

    if (step === "group") {
      if (index < groupStart || index >= groupStart + each) return;
      const nextCount = groupTapped + 1;
      setTapped((prev) => new Set(prev).add(index));
      setLabels((prev) => new Map(prev).set(index, nextCount));
      return;
    }

    if (step === "count-all") {
      const nextCount = tapped.size + 1;
      setTapped((prev) => new Set(prev).add(index));
      setLabels((prev) => new Map(prev).set(index, nextCount));
    }
  };

  const nextIndexForStep = (index: number): boolean => {
    if (tapped.has(index)) return false;
    if (step === "group") {
      return index === groupStart + groupTapped && index < groupStart + each;
    }
    if (step === "count-all") {
      return index === tapped.size && index < total;
    }
    return false;
  };

  const goNext = () => {
    if (step === "group" && groupIndex < groups - 1) {
      setGroupIndex((value) => value + 1);
      return;
    }
    if (step === "group") {
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
      <TeachStepDots current={stepIndex} total={totalSteps} />

      <p className="min-h-[3.5rem] text-center text-lg font-bold leading-snug text-ink md:text-xl">
        {caption}
      </p>

      {step !== "done" && (
        <p className="text-center text-4xl font-bold text-lavender-dark md:text-5xl">
          {step === "group"
            ? `${groupTapped} / ${each}`
            : `${tapped.size} / ${total}`}
        </p>
      )}

      {step === "group" && (
        <div className="rounded-3xl border-4 border-lavender-dark/40 bg-lavender/10 p-4">
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: each }, (_, offset) => {
              const index = groupStart + offset;
              return (
                <TeachObjectTile
                  key={index}
                  emoji={emoji}
                  disabled={stepComplete}
                  isDone={tapped.has(index)}
                  isNext={nextIndexForStep(index)}
                  countLabel={labels.get(index)}
                  accent={GROUP_ACCENTS[groupIndex % 3]}
                  onClick={() => handleTap(index)}
                />
              );
            })}
          </div>
        </div>
      )}

      {(step === "count-all" || step === "done") && (
        <div className="rounded-3xl border-4 border-grass-dark/40 bg-grass/10 p-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: groups }, (_, gIndex) => {
              const start = gIndex * each;
              return (
                <div key={gIndex} className="flex items-center gap-2">
                  {gIndex > 0 && <span className="text-2xl font-bold text-lavender-dark">×</span>}
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: each }, (_, offset) => {
                      const index = start + offset;
                      return (
                        <TeachObjectTile
                          key={index}
                          emoji={emoji}
                          disabled={step === "done" || stepComplete}
                          isDone={tapped.has(index) || step === "done"}
                          isNext={step === "count-all" && nextIndexForStep(index)}
                          countLabel={step === "done" ? index + 1 : labels.get(index)}
                          accent={GROUP_ACCENTS[gIndex % 3]}
                          onClick={() => handleTap(index)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-lavender-dark bg-lavender text-2xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
            {groups}
          </span>
          <span className="text-3xl font-bold text-ink/50">×</span>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-lavender-dark bg-lavender text-2xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
            {each}
          </span>
          <span className="text-3xl font-bold text-ink/50">=</span>
          <span className="animate-star-burst flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-grass-dark bg-grass text-3xl font-bold text-white md:h-20 md:w-20 md:text-4xl">
            {answer}
          </span>
        </div>
      )}

      {stepComplete && step !== "done" && (
        <div className="flex justify-center pt-2">
          <TeachNextButton
            theme="multiply"
            label={step === "count-all" ? "See answer! ✨" : "Next group →"}
            onClick={goNext}
          />
        </div>
      )}
    </div>
  );
}
