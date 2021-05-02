import HandleBarHelpers from "./Helpers.ts";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
/**
 * Creates a instance of HandleBarHelper and register each custom helper
 */
const registerHandlebars = (logger: log.Logger) => {
  logger.info("Handlebar Registration Started");
  const handlerBarHelper = new HandleBarHelpers(logger);
  handlerBarHelper.nowHelper();
  handlerBarHelper.randomValueHelper();
  handlerBarHelper.requestHelper();
  handlerBarHelper.numBetweenHelper();
  logger.info("Handlebar helpers registration completed");
};
export default registerHandlebars;
