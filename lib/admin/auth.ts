export const ADMIN_COOKIE_NAME = "admin_session";

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeAdminToken(password: string): Promise<string> {
  return sha256Hex(password);
}

export async function isValidAdminToken(token: string | undefined | null): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;
  const expected = await computeAdminToken(password);
  return token === expected;
}
