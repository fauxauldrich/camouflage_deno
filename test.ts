import { CamouflageConfig, CamouflageServer } from "./mod.ts";
import { YamlLoader } from "https://deno.land/x/yaml_loader/mod.ts";

const configLoader = new YamlLoader();
const config: CamouflageConfig = <CamouflageConfig>await configLoader.parseFile("./config.yaml");
const inputs = [
  config.loglevel,
  config.protocols.http.enable,
  config.protocols.http.port,
  config.protocols.http.mocks,
  config.protocols.https.enable,
  config.protocols.https.port,
  config.protocols.https.cert,
  config.protocols.https.key,
];

const camouflageServer: CamouflageServer = new CamouflageServer();
// @ts-ignore ignore
camouflageServer.start(...inputs);
