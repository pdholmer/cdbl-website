export const MIN_PASSWORD_LENGTH = 10;

/** Returns a plain-language problem, or null when the new password is acceptable. */
export const passwordProblem = (password: string, confirm: string): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Passwords need at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password !== confirm) return "The two passwords don't match.";
  return null;
};
