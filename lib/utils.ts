import xss from "xss";

export function sanitize(data: Record<string, unknown> | FormData) {
  const sanitized: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, val]) => {
    sanitized[String(key)] = xss(val);
  });
  return sanitized;
}