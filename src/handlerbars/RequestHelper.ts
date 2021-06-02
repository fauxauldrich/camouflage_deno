import HandlebarsJS from "https://dev.jspm.io/handlebars@4.7.7";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
import { Request } from "https://deno.land/x/opine@1.3.3/mod.ts";

export default class RequestHelper {
  private logger: log.Logger;
  constructor(logger: log.Logger) {
    this.logger = logger;
  }
  register = () => {
    // @ts-ignore handlerbars
    HandlebarsJS.registerHelper("capture", (context) => {
      // Get the request object passed in from the context by calling template({request: req})
      const request: Request = context.data.root.request;
      // Get the from value passed in while calling {{capture from=}}, accepted values query, headers, path, body
      // For query and headers, key is required, else if not found a null/undefined value will be automatically returned.
      // For path additional input regex is mandatory, if not passed return error
      // For body additional inputs using and selector are mandatory, if not passed return error
      const from: string = context.hash.from;
      switch (from) {
        case "query":
          return request.query[context.hash.key];
        case "headers":
          return request.headers.get(context.hash.key);
        case "path":
          if (typeof context.hash.regex === "undefined") {
            this.logger.debug("ERROR: No regex specified");
            return "Please specify a regex with path";
          } else {
            const regex = new RegExp(context.hash.regex);
            if (regex.test(request.path)) {
              const value = regex.exec(request.path);
              if (value) {
                return value[1];
              } else {
                return "No match found";
              }
            } else {
              this.logger.debug(`ERROR: No match found for specified regex ${context.hash.regex}`);
              return "No match found.";
            }
          }
        case "body":
          if (typeof context.hash.using === "undefined" || typeof context.hash.selector == "undefined") {
            this.logger.debug("ERROR: No selector or using values specified");
            return "Please specify using and selector fields.";
          } else {
            const regex = new RegExp(context.hash.selector);
            let body = context.data.root.request_body;
            if (typeof body === "object") {
              body = JSON.stringify(body, null, 2);
            }
            switch (context.hash.using) {
              case "regex":
                if (regex.test(body)) {
                  const value = regex.exec(body);
                  if (value) {
                    return value[1];
                  } else {
                    return "No match found";
                  }
                } else {
                  this.logger.error(`ERROR: No match found for specified regex ${context.hash.selector}`);
                  return "No match found.";
                }
              // case "jsonpath":
              //   try {
              //     return jsonpath.query(request.body, context.hash.selector);
              //   } catch (err) {
              //     this.logger.debug(`ERROR: No match found for specified jsonpath ${context.hash.selector}`);
              //     this.logger.error(`ERROR: ${err}`);
              //     return "some error occuered";
              //   }
              default:
                return null;
            }
          }
        default:
          return null;
      }
    });
  };
}
