import * as log from "https://deno.land/std@0.95.0/log/mod.ts";

export async function getLogger(loglevel: log.LevelName) {
    await log.setup({
        handlers: {
            console: new log.handlers.ConsoleHandler(loglevel),
        },
        loggers: {
            default: {
                level: "DEBUG",
                handlers: ["console"],
            }
        },
    });
    const logger = log.getLogger();
    return logger;
}