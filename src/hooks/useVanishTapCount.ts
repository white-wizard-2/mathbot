import { useCallback, useRef, useState } from "react";

export type VanishLabel = {
  id: number;
  index: number;
  value: number;
};

export function useVanishTapCount() {
  const [tappedIndices, setTappedIndices] = useState<Set<number>>(() => new Set());
  const [vanishLabels, setVanishLabels] = useState<VanishLabel[]>([]);
  const labelId = useRef(0);

  const reset = useCallback(() => {
    setTappedIndices(new Set());
    setVanishLabels([]);
  }, []);

  const handleTap = useCallback((index: number, disabled: boolean) => {
    if (disabled) return;
    if (tappedIndices.has(index)) return;

    const value = tappedIndices.size + 1;
    const id = labelId.current + 1;
    labelId.current = id;

    setTappedIndices((prev) => new Set(prev).add(index));
    setVanishLabels((prev) => [...prev, { id, index, value }]);

    window.setTimeout(() => {
      setVanishLabels((prev) => prev.filter((label) => label.id !== id));
    }, 900);
  }, [tappedIndices]);

  return { tappedIndices, vanishLabels, handleTap, reset };
}

export function useSubtractTapCount(takeAway: number) {
  const [removedIndices, setRemovedIndices] = useState<Set<number>>(() => new Set());
  const [countedIndices, setCountedIndices] = useState<Set<number>>(() => new Set());
  const [vanishLabels, setVanishLabels] = useState<VanishLabel[]>([]);
  const labelId = useRef(0);

  const reset = useCallback(() => {
    setRemovedIndices(new Set());
    setCountedIndices(new Set());
    setVanishLabels([]);
  }, []);

  const handleTap = useCallback(
    (index: number, disabled: boolean) => {
      if (disabled) return;
      if (removedIndices.has(index) || countedIndices.has(index)) return;

      if (removedIndices.size < takeAway) {
        setRemovedIndices((prev) => new Set(prev).add(index));
        return;
      }

      const value = countedIndices.size + 1;
      const id = labelId.current + 1;
      labelId.current = id;

      setCountedIndices((prev) => new Set(prev).add(index));
      setVanishLabels((prev) => [...prev, { id, index, value }]);

      window.setTimeout(() => {
        setVanishLabels((prev) => prev.filter((label) => label.id !== id));
      }, 900);
    },
    [countedIndices, removedIndices, takeAway],
  );

  return { removedIndices, countedIndices, vanishLabels, handleTap, reset };
}
