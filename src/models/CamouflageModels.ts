export interface CamouflageResponse {
  status: string;
  body: string;
  headers: Record<string, string>;
  delay?: number;
}
export interface Protocols {
  http: HttpProtocol;
  https: HttpsProtocol;
}
interface HttpProtocol {
  enable: boolean;
  port: number;
  mocks: string;
}
interface HttpsProtocol {
  enable: boolean;
  port: number;
  cert: string;
  key: string;
}

export interface LogLevels {
  loglevel: "NOTSET" | "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
}
