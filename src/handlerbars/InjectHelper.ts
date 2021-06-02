import HandlebarsJS from "https://dev.jspm.io/handlebars@4.7.7";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
import { Request } from "https://deno.land/x/opine@1.3.3/mod.ts";

export default class InjectHelper {
  logger: log.Logger;
  constructor(logger: log.Logger) {
    this.logger = logger;
  }
  register = () => {
    // @ts-ignore handlerbars
    HandlebarsJS.registerHelper("inject", (context) => {
      const request: Request = context.data.root.request;
      const result = eval(context.fn(this));
      return result;
    });
  };
}
