import HandlebarsJS from "https://dev.jspm.io/handlebars@4.7.7";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";

export default class NumBetweenHelper {
  private logger: log.Logger;
  constructor(logger: log.Logger) {
    this.logger = logger;
  }
  register = () => {
    // @ts-ignore handlerbars
    HandlebarsJS.registerHelper("num_between", (context) => {
      // If lower or upper value is not passed, return 0
      if (typeof context.hash.lower === "undefined" || typeof context.hash.upper === "undefined") {
        this.logger.error("lower or upper value not specified.");
        return 0;
      } else {
        const lower = parseInt(context.hash.lower);
        const upper = parseInt(context.hash.upper);
        // If lower value is greater than upper value, log error and return 0
        if (lower > upper) {
          this.logger.error("lower value cannot be greater than upper value.");
          return 0;
        }
        const num = Math.floor(Math.random() * (upper - lower + 1) + lower);
        return num;
      }
    });
  };
}
