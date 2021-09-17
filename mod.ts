import { opine } from "https://deno.land/x/opine@1.3.3/mod.ts";
import GlobalRoutes from "./src/routes/GlobalRoutes.ts";
import registerHandlebars from "./src/handlerbars/Init.ts";
import { Protocols } from "./src/models/CamouflageModels.ts";
import { getLogger } from "./src/logger/index.ts";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";

export class CamouflageServer {
  start = async (
    options: CamouflageOptions,
  ) => {
    const { loglevel, mocksDir, httpEnable, httpPort, httpsEnable, httpsPort, cert, key } = options;
    // setLogLevel(loglevel);
    const logger = await getLogger(loglevel);
    const app = opine();
    registerHandlebars(logger);
    const globalRoutes: GlobalRoutes = new GlobalRoutes(app, mocksDir, logger);
    globalRoutes.defineGlobalRoutes();
    if (httpEnable) {
      logger.info(`HTTP Server started at http://localhost:${httpPort}`);
      app.listen({ port: httpPort });
    }
    if (httpsEnable && typeof cert != "undefined" && typeof key != "undefined") {
      logger.info(`HTTPs Server started at https://localhost:${httpsPort}`);
      logger.debug(`HTTPs Server started at https://localhost:${httpsPort}`);
      app.listen({
        port: httpsPort,
        certFile: cert,
        keyFile: key,
      });
    }
  };
}

export interface CamouflageOptions {
  loglevel: log.LevelName,
  mocksDir: string,
  httpEnable: boolean,
  httpPort: number,
  httpsEnable: boolean,
  httpsPort: number,
  cert?: string,
  key?: string
}

export interface CamouflageConfig {
  loglevel: log.LevelName;
  mocks: string;
  protocols: Protocols;
}
