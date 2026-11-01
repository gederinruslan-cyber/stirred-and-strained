/** The Bar Assistant open data commit the house library is built from (data/SOURCES.md). */
export const PINNED_COMMIT = "5a504d4";

/** Facts only, as extracted from Bar Assistant open data. */
export type Snapshot = {
  source: string;
  commit: string;
  ingredients: { id: string; name: string; parent: string | null; abv: number; brand: boolean }[];
  cocktails: {
    id: string;
    name: string;
    method: string | null;
    glass: string | null;
    tags: string[];
    source: string | null;
    author: string | null;
    lines: {
      ingredient: string;
      amount: number | null;
      max: number | null;
      units: string;
      optional: boolean;
    }[];
  }[];
};
