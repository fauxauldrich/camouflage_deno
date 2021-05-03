# Getting Started

<img src="docs/camouflage.png" alt="camouflage.png" width="300"/>

[Full Documentation](https://fauxauldrich.github.io/camouflage_deno/)

Camouflage is a service virtualization tool inspired by [namshi/mockserver](https://github.com/namshi/mockserver). As the original description says, the mocking/service virtualization works on a file based structure where _you simply organize your mocked HTTP responses in a bunch of mock files and it will serve them like they were coming from a real API; in this way you can write your frontends without caring too much whether your backend is really ready or not._

- Camouflage is a deno module, therefore to install Camouflage, you'd need to [install Deno](https://deno.land/#installation) first, if you haven't already done so.
- You can then import Camouflage into your project:

```javascript
import { CamouflageConfig, CamouflageServer } from "https://deno.land/x/camouflage@0.0.2/mod.ts";
```

- Note that you'd also need to provide a config file to initialize Camouflage.

```javascript
import { YamlLoader } from "https://deno.land/x/yaml_loader/mod.ts";
const configLoader = new YamlLoader();
const config: CamouflageConfig = <CamouflageConfig>await configLoader.parseFile("./config.yaml");
```

- Create a `config.yaml` file at the root of your project. And paste the following content (update if required).

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

- In case you need HTTPs endpoints, create .crt and .key files before starting the server. For testing purposes you can generate a self-signed certificate. If HTTPs endpoints are not required, update above config.yaml to disable https protocol

```shell
openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 -keyout server.key -out server.crt
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

- Run using the command

```shell
deno run --allow-net --allow-read --allow-write --unstable test.ts
```

## Create your first mock

Camouflage follows the same convention as mockserver to create mocks. For example,

```
All further references to the variable ${MOCK_DIR} in this documentation will refer
to the directory you have specified in your config.yaml file under
config.protocols.http.mocks
```

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

Navigate to [http://localhost:8080/hello-world](http://localhost:8080/hello-world)
