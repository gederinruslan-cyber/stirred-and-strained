// The "Your take" form's state (M2-07), shared by the form and its server action.
export const NOTE_MAX = 1000;
export type TakeValues = { rating: string; note: string };
export type TakeState = { values?: TakeValues; tooLong?: boolean; down?: boolean };
