import { Span } from "opentracing";

export class SpanNull extends Span {
  log(_keyValuePairs: { [p: string]: any }, _timestamp?: number): this {
    return this;
  }

  setTag(_key: string, _value: any): this {
    return this;
  }

  finish(_finishTime?: number) {}
}
