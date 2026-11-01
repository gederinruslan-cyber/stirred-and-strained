// What the account forms say (docs/design/auth-screens.md). Never whether an email has an account.
export type FormState = {
  /** The email as typed, shown back after an error; passwords never come back. */
  email?: string;
  /** A field error names its field; a form-level error has none. */
  error?: { field?: "email" | "password"; text: string };
  /** "Check your email", for the address typed. */
  sent?: string;
  /** The confirm or reset link is spent, expired or the password was wrong. */
  badLink?: boolean;
};

export const COPY = {
  noEmail: "Enter your email address.",
  badEmail: "That doesn't look like an email address. It needs an @, like ana@example.test.",
  noPassword: "Enter your password.",
  passwordLength: "Use 10 to 128 characters.",
  noMatch: "That email and password don't match.",
  rateLimited: "Too many tries. Wait a few minutes and try again.",
  ourSide: "Something went wrong on our side. Try again in a minute.",
};
