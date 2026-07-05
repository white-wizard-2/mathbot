export type HintRequest =
  | { game: "count"; object: string; picked: number; total: number }
  | { game: "add"; a: number; b: number; picked: number }
  | { game: "subtract"; a: number; b: number; picked: number };

export type HintResponse = {
  message: string;
};

export type HealthResponse = {
  ok: boolean;
  model: string;
  omlxUrl: string;
};
