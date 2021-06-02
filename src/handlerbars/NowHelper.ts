import HandlebarsJS from "https://dev.jspm.io/handlebars@4.7.7";
import moment from "https://deno.land/x/momentjs@2.29.1-deno/mod.ts";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";

export default class NowHelper {
  private logger: log.Logger;
  constructor(logger: log.Logger) {
    this.logger = logger;
  }
  register = () => {
    // @ts-ignore no types available
    HandlebarsJS.registerHelper("now", (context) => {
      // If now helper is called without a format, set a default format as YYYY-MM-DD hh:mm:ss else use the format provided
      const format = typeof context.hash.format === "undefined" ? "YYYY-MM-DD hh:mm:ss" : context.hash.format;
      // Set default offset to be used if offset is not specified. Default offset is 0s i.e. no offset
      let offsetUnit: moment.unitOfTime.DurationConstructor = "s";
      let offsetAmount = 0;
      // If offset is defined the value will be stored in context.hash.offset, eg X days.
      if (typeof context.hash.offset !== "undefined") {
        // Split value by a space, first element will be the amount of offset i.e. X, second element will be unit of offset, i.e. days
        const offset = context.hash.offset.split(" ");
        offsetAmount = <number>offset[0];
        offsetUnit = <moment.unitOfTime.DurationConstructor>offset[1];
      }
      // Return a value with specified format and added offset
      switch (format) {
        case "epoch":
          return moment().add(offsetAmount, offsetUnit).format("x");
        case "unix":
          return moment().add(offsetAmount, offsetUnit).format("X");
        default:
          return moment().add(offsetAmount, offsetUnit).format(format);
      }
    });
  };
}
