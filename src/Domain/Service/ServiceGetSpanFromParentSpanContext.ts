import { Span, SpanContext, Tags } from "opentracing";
import PromiseB from "bluebird";
import { JaegerTracer } from "jaeger-client";

export class ServiceGetSpanFromParentSpanContext {
  private readonly _jaegerTracer: JaegerTracer;

  get jaegerTracer(): JaegerTracer {
    return this._jaegerTracer;
  }

  constructor(args: { jaegerTracer: JaegerTracer }) {
    this._jaegerTracer = args.jaegerTracer;
  }

  execute(args: {
    nameOperation: string;
    parentSpanContext: SpanContext | undefined;
  }): PromiseB<Span> {
    return PromiseB.try(() => {
      return this.jaegerTracer.startSpan(args.nameOperation, {
        childOf: args.parentSpanContext,
        tags: { [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER },
      });
    });
  }
}
