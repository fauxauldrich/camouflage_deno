import { CamouflageConfig, CamouflageOptions, CamouflageServer } from "./mod.ts";
import { YamlLoader } from "https://deno.land/x/yaml_loader/mod.ts";

const configLoader = new YamlLoader();
const config: CamouflageConfig = <CamouflageConfig>await configLoader.parseFile("./config.yaml");
const camouflageOptions: CamouflageOptions = {
  loglevel: config.loglevel,
  mocksDir: config.mocks,
  httpEnable: config.protocols.http.enable,
  httpPort: config.protocols.http.port,
  httpsEnable: config.protocols.https.enable,
  httpsPort: config.protocols.https.port,
  cert: config.protocols.https.cert,
  key: config.protocols.https.key,
}
const camouflageServer: CamouflageServer = new CamouflageServer();
camouflageServer.start(camouflageOptions);
