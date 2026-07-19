import { useCallback, useRef, useState } from "react";

export type TapLabel = {
  id: number;
  index: number;
  value: number;
};

export function useTapCount() {
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [labels, setLabels] = useState<TapLabel[]>([]);
  const labelId = useRef(0);

  const reset = useCallback(() => {
    setTapped(new Set());
    setLabels([]);
  }, []);

  const handleTap = useCallback((index: number, disabled: boolean) => {
    if (disabled || tapped.has(index)) return;

    const value = tapped.size + 1;
    const id = labelId.current + 1;
    labelId.current = id;

    setTapped((prev) => new Set(prev).add(index));
    setLabels((prev) => [...prev, { id, index, value }]);

    window.setTimeout(() => {
      setLabels((prev) => prev.filter((label) => label.id !== id));
    }, 900);
  }, [tapped]);

  return { tapped, labels, handleTap, reset };
}
