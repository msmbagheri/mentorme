import pino from "pino";

const level = process.env.LOG_LEVEL ?? "info";

// Structured logging (Pino). Sentry-ready: errors can be forwarded from a single place.
export const logger = pino({
  level,
  base: { service: "mentorme" },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

type LogMeta = Record<string, unknown>;

export const log = {
  auth: (msg: string, meta?: LogMeta) => logger.info({ stream: "auth", ...meta }, msg),
  lead: (msg: string, meta?: LogMeta) => logger.info({ stream: "lead", ...meta }, msg),
  publish: (msg: string, meta?: LogMeta) =>
    logger.info({ stream: "publish", ...meta }, msg),
  permission: (msg: string, meta?: LogMeta) =>
    logger.warn({ stream: "permission", ...meta }, msg),
  error: (msg: string, meta?: LogMeta) => logger.error({ stream: "system", ...meta }, msg),
  info: (msg: string, meta?: LogMeta) => logger.info(meta ?? {}, msg),
};

export default logger;
