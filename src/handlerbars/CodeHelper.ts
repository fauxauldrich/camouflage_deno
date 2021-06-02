import HandlebarsJS from "https://dev.jspm.io/handlebars@4.7.7";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
import { Request } from "https://deno.land/x/opine@1.3.3/mod.ts";
/**
 * Defines and registers custom handlebar helper - code
 */
export class CodeHelper {
  logger: log.Logger;
  constructor(logger: log.Logger) {
    this.logger = logger;
  }
  /**
   * Registers code helper
   * - Define request and logger in the scope of the code helper context, allowing user to use request, logger in their mock files
   * - If file path is passed, check if file exists and send the return value to HttpParser to process
   * - Evaluate the response of the function passed in and return the resulting response object to HttpParser
   * @returns {void}
   */
  register = () => {
    // @ts-ignore handlerbars
    HandlebarsJS.registerHelper("code", (context) => {
      const request: Request = context.data.root.request;
      const code = eval(context.fn(this));
      code["CamouflageResponseType"] = "code";
      return JSON.stringify(code);
    });
  };
}
