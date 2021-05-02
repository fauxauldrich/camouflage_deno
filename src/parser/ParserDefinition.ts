import { Request } from "https://deno.land/x/opine@1.3.3/mod.ts";
import path from "https://deno.land/std@0.95.0/node/path.ts";
import * as fs from "https://deno.land/std@0.95.0/fs/mod.ts";
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
import HandlebarsJS from "https://dev.jspm.io/handlebars@4.7.7";
import { CamouflageResponse } from "../models/CamouflageModels.ts";

export default class Parser {
  private request: Request;
  private mockDir: string;
  private logger: log.Logger;
  private body: unknown;

  constructor(request: Request, body: string, mockDir: string, logger: log.Logger) {
    this.request = request;
    this.mockDir = mockDir;
    this.logger = logger;
    this.body = body;
  }
  getMatchedDir = () => {
    const reqDetails = {
      method: this.request.method.toUpperCase(),
      path: this.request.path,
    };
    const matchedDir = getWildcardPath(reqDetails.path, this.mockDir);
    return matchedDir;
  };
  getResponse = (mockFile: string): Promise<CamouflageResponse> => {
    /**
     * Since response file contains headers and body both, a PARSE_BODY flag is required
     * to tell the logic if it's currently parsing headers or body
     * Set responseBody to an empty string and set a default response object
     */
    let PARSE_BODY = false;
    let responseBody = "";
    const response: CamouflageResponse = {
      status: "404",
      body: '{"error": "Not Found"}',
      headers: {
        "content-type": "application/json",
      },
      delay: 0,
    };
    // Check if mock file exists
    if (fs.existsSync(mockFile)) {
      const platformEOL = Deno.build.os === "darwin" || Deno.build.os === "linux" ? fs.EOL.LF : fs.EOL.CRLF;
      const decoder = new TextDecoder("utf-8");
      const data = Deno.readFileSync(mockFile);
      // @ts-ignore handlebars
      const template = HandlebarsJS.compile(decoder.decode(data));
      const fileContent: string[] = template({ request: this.request, request_body: this.body }).split(platformEOL);
      //Read file line by line
      fileContent.forEach((line, index) => {
        /**
         * Set PARSE_BODY flag to try when reader finds a blank line,
         * since according to standard format of a raw HTTP Response,
         * headers and body are separated by a blank line.
         */
        if (line === "") {
          PARSE_BODY = true;
        }
        //If line includes HTTP/HTTPS i.e. first line. Get the response status code
        if (line.includes("HTTP")) {
          const regex = /(?<=HTTP\/\d).*?\s+(\d{3,3})/i;
          if (!regex.test(line)) {
            this.logger.error("Response code should be valid string");
            throw new Error("Response code should be valid string");
          }
          const status = line.match(regex);
          if (status !== null) {
            response.status = status[1];
            this.logger.debug("Response Status set to " + response.status);
          } else {
            this.logger.error("Response Status could not be found.");
          }
        } else {
          /**
           * If following conditions are met:
           *      Line is not blank
           *      And parser is not currently parsing response body yet i.e. PARSE_BODY === false
           * Then:
           *      Split line by :, of which first part will be header key and 2nd part will be header value
           *      If headerKey is response delay, set variable DELAY to headerValue
           */
          if (line !== "" && !PARSE_BODY) {
            const headerKey = line.split(":")[0];
            const headerValue = line.split(":")[1];
            if (headerKey === "Response-Delay") {
              response.delay = <number>(<unknown>headerValue);
              this.logger.debug(`Delay Set ${headerValue}`);
            } else {
              response.headers[headerKey] = headerValue;
              this.logger.debug(`Headers Set ${headerKey}: ${headerKey}`);
            }
          }
        }
        // If parsing response body. Concatenate every line till last line to a responseBody variable
        if (PARSE_BODY) {
          responseBody = responseBody + line;
        }
        /**
         * If on last line, do following:
         *    Trim and remove whitespaces from the responseBody
         *    Compile the Handlebars to generate a final response
         *    Set PARSE_BODY flag back to false and responseBody to blank
         *    Set express.Response Status code to response.status
         *    Send the generated Response, from a timeout set to send the response after a DELAY value
         */
        if (index == fileContent.length - 1) {
          responseBody = responseBody.replace(/\s+/g, " ").trim();
          responseBody = responseBody.replace(/{{{/, "{ {{");
          responseBody = responseBody.replace(/}}}/, "}} }");
          response.body = responseBody;
          PARSE_BODY = false;
          responseBody = "";
          this.logger.debug(`Generated Response ${response.body}`);
          return response;
        }
      });
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(response);
        }, response.delay);
      });
    } else {
      this.logger.error(`No suitable mock file found: ${mockFile}. Sending default response.`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(response);
        }, response.delay);
      });
    }
  };
}
const removeBlanks = (array: Array<string>) => {
  return array.filter(function (i) {
    return i;
  });
};
const getWildcardPath = (dir: string, mockDir: string) => {
  const steps: string[] = removeBlanks(dir.split("/"));
  let testPath;
  let newPath = path.join(mockDir, steps.join("/"));
  let exists = false;

  while (steps.length) {
    steps.pop();
    testPath = path.join(mockDir, steps.join("/"), "__");
    exists = fs.existsSync(testPath);
    if (exists) {
      newPath = testPath;
      break;
    }
  }
  return newPath;
};
