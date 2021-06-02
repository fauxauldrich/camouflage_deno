import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
import { CodeHelper } from "./CodeHelper.ts";
import { CsvHelper } from "./CsvHelper.ts";
import InjectHelper from "./InjectHelper.ts";
import NowHelper from "./NowHelper.ts";
import NumBetweenHelper from "./NumBetweenHelper.ts";
import RandomValueHelper from "./RandomValueHelper.ts";
import RequestHelper from "./RequestHelper.ts";
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 */
const registerHandlebars = (logger: log.Logger) => {
  logger.info("Handlebar Registration Started");
  new NowHelper(logger).register();
  new NumBetweenHelper(logger).register();
  new RandomValueHelper(logger).register();
  new RequestHelper(logger).register();
  new InjectHelper(logger).register();
  new CodeHelper(logger).register();
  new CsvHelper(logger).register();
  logger.info("Handlebar helpers registration completed");
};
export default registerHandlebars;
