// The recipe form's values and errors (M2-06), shared by the form and its server action.
export const METHOD_OPTIONS = ["shaken", "stirred", "built", "blended", "muddled", "layered"];
export const UNIT_OPTIONS = ["ml", "cl", "oz", "dash", "barspoon", "drop", "piece", "top"];
export const MAX_LINES = 30;

export type LineValues = { ingredient: string; amount: string; unit: string; optional: boolean };
export type RecipeValues = {
  name: string;
  method: string;
  glass: string;
  steps: string;
  lines: LineValues[];
};
/** `field` is the id of the control to fix (`name`, `line-3-amount`, `lines`…). */
export type FieldError = { field: string; text: string };
export type RecipeFormState = { values?: RecipeValues; errors?: FieldError[]; down?: boolean };

export const blankLine = (): LineValues => ({
  ingredient: "",
  amount: "",
  unit: "ml",
  optional: false,
});

/** The lines plus 4 blank rows, at least 8, never more than the api takes. */
export const withBlanks = (lines: LineValues[]) => {
  const rows = Math.min(MAX_LINES, Math.max(8, lines.length + 4));
  return [...lines, ...Array.from({ length: Math.max(0, rows - lines.length) }, blankLine)];
};
