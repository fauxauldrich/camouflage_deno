# Getting Started

- Camouflage is a deno module, therefore to install Camouflage, you'd need to [install Deno](https://deno.land/#installation){target=\_blank} first, if you haven't already done so.
- You can then import Camouflage into your project:

```javascript
import { CamouflageConfig, CamouflageServer } from "https://deno.land/x/camouflage@0.0.1/mod.ts";
```

- Note that you'd also need to provide a config file to initialize Camouflage.

```javascript
import { YamlLoader } from "https://deno.land/x/yaml_loader/mod.ts";
const configLoader = new YamlLoader();
const config: CamouflageConfig = <CamouflageConfig>await configLoader.parseFile("./config.yaml");
```

- Create a `config.yaml` file at the root of your project. And paste the following content (update if required).

## Configuration Options / Sample Config yml File

```yaml
loglevel: INFO
protocols:
  http:
    enable: true
    port: 8080
    mocks: "./mocks"
  https:
    enable: true
    port: 8443
    cert: "./certs/server.crt"
    key: "./certs/server.key"
```

- For simplicity, create an `inputs` array to store the configs in following order.

```javascript
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
```

- Finally, create an instance of `CamouflageServer` and call `start()` by spreading the `inputs` array as it's parameters

```javascript
const camouflageServer: CamouflageServer = new CamouflageServer();
// @ts-ignore ignore
camouflageServer.start(...inputs);
```

## Create your first mock

Camouflage follows the same convention as mockserver to create mocks. For example,

!!!note

    All further references to the variable ${MOCK_DIR} in this documentation will refer to the directory you have specified in your config.yaml file under config.protocols.http.mocks

1. You start by creating a directory ${MOCKS_DIR}/hello-world
2. Create a file GET.mock under ${MOCKS_DIR}/hello-world.
3. Paste following content:

```
HTTP/1.1 200 OK
X-Custom-Header: Custom-Value
Content-Type: application/json

{
    "greeting": "Hey! It works!"
}
```

Navigate to [http://localhost:8080/hello-world](http://localhost:8080/hello-world){target=\_blank}
