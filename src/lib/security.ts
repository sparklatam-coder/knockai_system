/** Allowed image extensions for file uploads */
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

/**
 * Validate and extract a safe file extension from a filename.
 * Returns the extension if allowed, or null if blocked.
 */
export function getSafeImageExtension(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_IMAGE_EXTENSIONS.has(ext) ? ext : null;
}

/**
 * Sanitize a CSV cell value to prevent formula injection.
 * Strips leading =, +, -, @, tab, and carriage return characters
 * that can trigger formula execution in Excel/Google Sheets.
 */
export function sanitizeCsvCell(value: string): string {
  return value.replace(/^[=+\-@\t\r]+/, "");
}

/**
 * Return a generic error message for database/internal errors.
 * Logs the real error server-side.
 */
export function safeDbError(error: { message: string }, context?: string): string {
  console.error(`[DB Error]${context ? ` ${context}:` : ""}`, error.message);
  return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

/** Minimum password length */
const MIN_PASSWORD_LENGTH = 10;

/**
 * Validate password strength.
 * Returns null if valid, or an error message string.
 */
export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
  }
  if (!/[A-Za-z]/.test(password)) {
    return "비밀번호에 영문자가 포함되어야 합니다.";
  }
  if (!/[0-9]/.test(password)) {
    return "비밀번호에 숫자가 포함되어야 합니다.";
  }
  return null;
}
