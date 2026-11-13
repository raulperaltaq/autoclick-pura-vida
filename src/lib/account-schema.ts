const missingSchemaObjectCodes = new Set(["PGRST204", "PGRST205", "42P01", "42703"]);

export function isSchemaMismatch(error: unknown): boolean {
  if (!error) return false;

  const code =
    typeof error === "object" && "code" in error && typeof error.code === "string"
      ? error.code
      : "";
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === "object" && "message" in error && typeof error.message === "string"
          ? error.message
          : "";
  const details =
    typeof error === "object" && "details" in error && typeof error.details === "string"
      ? error.details
      : "";

  if (missingSchemaObjectCodes.has(code)) return true;

  return /(?:\b(column|table|relation)\b.*\b(?:does not exist|do not exist|not found)\b|\b(?:could not find|cannot find)\b.*\b(column|table|relation)\b|\bmissing\b.*\b(column|table|relation)\b)/i.test(
    `${message} ${details}`,
  );
}
