import HandlebarsJS from "https://dev.jspm.io/handlebars@4.7.7";
import moment from "https://deno.land/x/momentjs@2.29.1-deno/mod.ts";
import { v4 } from "https://deno.land/std@0.95.0/uuid/mod.ts";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
import { Request } from "https://deno.land/x/opine@1.3.3/mod.ts";

export default class HandleBarHelpers {
  private logger: log.Logger;
  constructor(logger: log.Logger) {
    this.logger = logger;
  }
  nowHelper = () => {
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
  randomValueHelper = () => {
    // @ts-ignore HandlebarJS
    HandlebarsJS.registerHelper("randomValue", (context) => {
      // If length of randomValue is not specified, set default length to 16
      const length = typeof context.hash.length === "undefined" ? 16 : context.hash.length;
      // If type of randomValue is not specified, set default type to ALPHANUMERIC
      let type = typeof context.hash.type === "undefined" ? "ALPHANUMERIC" : context.hash.type;
      // If uppercase is specified, and is of ALPHABETICAL or ALPHANUMERIC type, add _UPPER to the type
      if (context.hash.uppercase && type.includes("ALPHA")) {
        type = type + "_UPPER";
      }
      // If type is UUID, return UUID, else generate a random value with specified type and length
      if (type === "UUID") {
        return v4.generate();
      } else {
        return randomString(length, genCharArray(type));
      }
    });
  };
  numBetweenHelper = () => {
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
  requestHelper = () => {
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
/**
 * Generates an random sequence of characters
 * @param {number} length - length of generated string
 * @param {string} chars - A sequence of valid characters for a specified type returned by genCharArray
 * @returns {string} A random sequence of characters of specified length
 */
const randomString = (length: number, chars: string): string => {
  var result = "";
  if (typeof chars === "undefined") {
    randomFixedInteger(length);
  } else {
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
/**
 * Generates an random number of given length
 * @param {number} length - length of number of be generated
 * @returns {number} A number of specified length. i.e. 10 digit number: 2341912498
 */
const randomFixedInteger = (length: number): number => {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
};

/**
 * Generates an string of characters to be used by randomString function for randomizing.
 * @param {string} type - Type of random value to be generated
 * @returns {string} A string of squence of valid characters according to type
 */
const genCharArray = (type: string): string => {
  let alphabet;
  //Create a numbers array of [0...9]
  const numbers = [...Array(10)].map((_, i) => i);
  switch (type) {
    case "ALPHANUMERIC":
      // If type is ALPHANUMERIC, return a string with characters [a-z][A-Z][0-9]
      alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 97) + String.fromCharCode(i + 65));
      return alphabet.join("") + numbers.join("");
    case "ALPHANUMERIC_UPPER":
      // If type is ALPHANUMERIC_UPPER, return a string with characters [A-Z][0-9]
      alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 65));
      return alphabet.join("") + numbers.join("");
    case "ALPHABETIC":
      // If type is ALPHABETIC, return a string with characters [a-z][A-Z]
      alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 97) + String.fromCharCode(i + 65));
      return alphabet.join("");
    case "ALPHABETIC_UPPER":
      // If type is ALPHABETIC_UPPER, return a string with characters [A-Z]
      alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 65));
      return alphabet.join("");
    case "NUMERIC":
      // If type is NUMERIC, return a string with characters [0-9]
      return numbers.join("");
    default:
      return "HANDLEBAR MATCH FAILED";
  }
};
