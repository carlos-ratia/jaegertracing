export const LogLevels = {
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

export declare type LogLevel = typeof LogLevels[keyof typeof LogLevels];

export interface LoggerInterface {
  error(message: object): this;
  warning(message: object): this;
  info(message: object): this;
  log(level: LogLevel, message: object): this;
}
