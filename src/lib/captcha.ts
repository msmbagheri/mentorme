import "server-only";
import crypto from "crypto";

/**
 * Self-hosted, stateless login captcha. No third-party service — chosen because
 * external captchas (reCAPTCHA/Turnstile) are unreliable or blocked in Iran.
 * The challenge SVG is rasterized to PNG at the route layer so the answer is not
 * present in the response markup. The answer is never sent to the client; a
 * short-lived HMAC token commits to it, and verification recomputes the HMAC
 * from the user's submission. No DB, no external calls.
 *
 * This module is crypto-only (no `sharp`) so it can be imported by the Node
 * auth graph without pulling a native image dependency into it.
 */

const TTL_MS = 3 * 60 * 1000; // token valid for 3 minutes
const LEN = 5;
// Unambiguous alphabet (no 0/O/1/I/L) so the distorted image stays solvable.
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
/** Non-production test sentinel; only honored when CAPTCHA_TEST_BYPASS=1. */
const TEST_ANSWER = "TESTBYPASS";

function secret(): string {
  return process.env.NEXTAUTH_SECRET ?? "insecure-dev-captcha-secret";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export interface Challenge {
  /** Signed token: `<expiryMs>.<hmac>`. Round-tripped with the user's answer. */
  token: string;
  /** SVG markup for the challenge (rasterize before sending to the client). */
  svg: string;
}

/** Create a fresh challenge: a random code, its signed token, and a distorted SVG. */
export function createChallenge(): Challenge {
  const answer = Array.from({ length: LEN }, () => CHARS[crypto.randomInt(CHARS.length)]).join("");
  const expiry = Date.now() + TTL_MS;
  const token = `${expiry}.${sign(`${expiry}.${answer}`)}`;
  return { token, svg: renderSvg(answer) };
}

/** True when the submitted answer matches the (unexpired) token. Constant-time. */
export function verifyCaptcha(token: string, answer: string): boolean {
  const normalized = (answer ?? "").trim().toUpperCase();

  // Env-gated escape hatch for E2E / local UI verification. Double-gated so it
  // can never be active in a production build.
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.CAPTCHA_TEST_BYPASS === "1" &&
    normalized === TEST_ANSWER
  ) {
    return true;
  }

  if (!token || !normalized) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expiry = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const expected = sign(`${expiry}.${normalized}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function renderSvg(text: string): string {
  const w = 160;
  const h = 52;
  const chars = text
    .split("")
    .map((ch, i) => {
      const x = 18 + i * 27;
      const rot = crypto.randomInt(-22, 23);
      const dy = crypto.randomInt(-5, 6);
      return `<text x="${x}" y="${34 + dy}" font-family="'DejaVu Sans', 'Courier New', monospace" font-size="30" font-weight="700" fill="#B0006A" transform="rotate(${rot} ${x} 32)">${ch}</text>`;
    })
    .join("");
  const noise = Array.from({ length: 5 }, () => {
    const x1 = crypto.randomInt(0, w);
    const y1 = crypto.randomInt(0, h);
    const x2 = crypto.randomInt(0, w);
    const y2 = crypto.randomInt(0, h);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E4007F" stroke-opacity="0.3" stroke-width="1"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#FDF2F8"/>${noise}${chars}</svg>`;
}
