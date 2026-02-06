const levels = ["debug", "info", "warn", "error"] as const;

type Level = (typeof levels)[number];

function getLevel() {
  const raw = process.env.SERVER_LOG_LEVEL ?? "info";
  return levels.includes(raw as Level) ? (raw as Level) : "info";
}

const currentLevel = getLevel();
const levelIndex = levels.indexOf(currentLevel);

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (levelIndex <= 0) console.debug(message, meta ?? {});
  },
  info(message: string, meta?: Record<string, unknown>) {
    if (levelIndex <= 1) console.info(message, meta ?? {});
  },
  warn(message: string, meta?: Record<string, unknown>) {
    if (levelIndex <= 2) console.warn(message, meta ?? {});
  },
  error(message: string, meta?: Record<string, unknown>) {
    console.error(message, meta ?? {});
  }
};
