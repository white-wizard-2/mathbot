export type HintBase = {
  picked: number;
  previousHint?: string;
  isRepeatMistake?: boolean;
  wrongAttempts?: number[];
};

export type HintRequest =
  | (HintBase & { game: "count"; object: string; total: number })
  | (HintBase & { game: "add"; a: number; b: number })
  | (HintBase & { game: "subtract"; a: number; b: number });

export type HintResponse = {
  message: string;
};

export type HealthResponse = {
  ok: boolean;
  model: string;
  omlxUrl: string;
};
