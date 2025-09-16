import xss from "xss";

export function sanitize(data: Record<string, unknown> | FormData): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  if (data instanceof FormData) {
    for (const [key, val] of data) {
      if (!key.includes("$ACTION_")) {
        sanitized[String(key)] = typeof val === "string" ? xss(val) : val;
      }
    }
  } else {
    for (const [key, val] of Object.entries(data)) {
      sanitized[String(key)] = typeof val === "string" ? xss(val) : val;
    }
  }
  return sanitized;
}