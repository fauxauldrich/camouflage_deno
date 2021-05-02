import { opine } from "https://deno.land/x/opine@1.3.3/mod.ts";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
import GlobalRoutes from "./src/routes/GlobalRoutes.ts";
import registerHandlebars from "./src/handlerbars/Init.ts";
import { Protocols } from "./src/models/CamouflageModels.ts";

export class CamouflageServer {
  start = async (
    loglevel: string,
    httpEnable: boolean,
    httpPort: number,
    httpMocksDir: string,
    httpsEnable: boolean,
    httpsPort: number,
    cert: string,
    key: string
  ) => {
    await log.setup({
      handlers: {
        console: new log.handlers.ConsoleHandler(setLogLevel(loglevel), {
          formatter: "{levelName} {msg}",
        }),
      },
    });
    const logger = log.getLogger();
    const app = opine();
    registerHandlebars(logger);
    const globalRoutes: GlobalRoutes = new GlobalRoutes(app, httpMocksDir, logger);
    globalRoutes.defineGlobalRoutes();
    if (httpEnable) {
      logger.info(`HTTP Server started at http://localhost:${httpPort}`);
      app.listen({ port: httpPort });
    }
    if (httpsEnable) {
      logger.info(`HTTP Server started at https://localhost:${httpsPort}`);
      app.listen({
        port: httpsPort,
        certFile: cert,
        keyFile: key,
      });
    }
  };
}

export function setLogLevel(loglevel: string): "NOTSET" | "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL" {
  return <"NOTSET" | "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL">loglevel.toUpperCase();
}

export interface CamouflageConfig {
  loglevel: string;
  protocols: Protocols;
}
