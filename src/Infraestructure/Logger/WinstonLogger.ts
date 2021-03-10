import winston from "winston";
import {
  LoggerInterface,
  LogLevel,
  LogLevels,
} from "../Interface/LoggerInterface";

class WinstonLogger implements LoggerInterface {
  private readonly adapter: winston.Logger;

  constructor() {
    this.adapter = winston.createLogger({
      levels: winston.config.syslog.levels,
      format: winston.format.combine(
        winston.format.ms(),
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [new winston.transports.Console()],
    });
  }

  info(message: object) {
    return this.log(LogLevels.INFO, message);
  }

  warning(message: object): this {
    return this.log(LogLevels.WARNING, message);
  }

  error(message: object) {
    return this.log(LogLevels.ERROR, message);
  }

  log(level: LogLevel, message: object): this {
    this.adapter.log(level, message);
    return this;
  }
}

const WinstonLoggerInstance = new WinstonLogger();
export { WinstonLoggerInstance };
