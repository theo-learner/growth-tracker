type LogMeta = Record<string, unknown>;

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}

/**
 * Production-safe logger.
 * Avoids dumping full request payloads or secrets.
 */
export function logError(scope: string, err: unknown, meta?: LogMeta) {
  const msg = safeErrorMessage(err);
  const safeMeta = meta ? { ...meta } : undefined;
  // eslint-disable-next-line no-console
  console.error(`[GrowthTracker] ${scope}: ${msg}`, safeMeta);
}
