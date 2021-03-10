import {
  LoggerInterface,
  LogLevel,
} from "../../Infraestructure/Interface/LoggerInterface";

export class LoggerNull implements LoggerInterface {
  error(_message: object): this {
    return this;
  }

  info(_message: object): this {
    return this;
  }

  log(_level: LogLevel, _message: object): this {
    return this;
  }

  warning(_message: object): this {
    return this;
  }
}
