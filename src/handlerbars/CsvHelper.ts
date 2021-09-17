import HandlebarsJS from "https://dev.jspm.io/handlebars@4.7.7";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
import { Request } from "https://deno.land/x/opine@1.3.3/mod.ts";
import { readCSVObjects } from "https://deno.land/x/csv/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
/**
 * Defines and registers custom handlebar helper - csv
 */
export class CsvHelper {
  logger: log.Logger;
  constructor(logger: log.Logger) {
    this.logger = logger;
  }
  /**
   * Registers csv helper
   * - Define request and logger in the scope of the code helper context, allowing user to use request, logger in their mock files
   * - Fetch the file path, key, value and random variables from the the helper
   * - Throw error if file path not defined log and return appropriate error
   * - if random is true, evaluate response for one random row from csv file
   * - else, evaluate response for all rows from csv file matching a search pattern using specified key and value
   * @returns {void}
   */
  register = (): void => {
    // @ts-ignore handlerbars
    HandlebarsJS.registerHelper("csv", async (context) => {
      const request: Request = context.data.root.request;
      const src = context.hash.src;
      const key = context.hash.key;
      const value = context.hash.value;
      const random = context.hash.random;
      if (typeof src === "undefined") {
        this.logger.error("'src' is a required parameter and has not been set.");
        return "'src' is a required parameter and has not been set.";
      } else {
        if (existsSync(src)) {
          const f = await Deno.open(src);
          const options = {
            columnSeparator: ";",
          };
          const csvData = [];
          for await (const obj of readCSVObjects(f, options)) {
            csvData.push(obj);
          }
          let result = {};
          if (random) {
            result = csvData[Math.floor(Math.random() * csvData.length)];
          } else {
            if (typeof key === "undefined" || typeof value === "undefined") {
              this.logger.error("If random is false, 'key' & 'value' are required parameters");
              return "If random is false, 'key' & 'value' are required parameters";
            }
            result = csvData.filter((jsonObj: any) => {
              return jsonObj[key] === value;
            });
          }
          const output = eval(context.fn(this)).trim();
          return output;
        } else {
          this.logger.error("CSV file not found");
          return "CSV file not found";
        }
      }
    });
  };
}
