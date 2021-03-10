import { FORMAT_HTTP_HEADERS, Span, SpanContext } from "opentracing";
import PromiseB from "bluebird";
import { JaegerTracer } from "jaeger-client";
import { IReportTraceDAO } from "../Interface/IReportTraceDAO";
import { TraceDTO } from "../DTO/TraceDTO";
import { ServiceGetSpanFromParentSpanContext } from "./ServiceGetSpanFromParentSpanContext";

export class ServiceGetSpanFromTrace {
  private readonly _jaegerTracer: JaegerTracer;
  private readonly _traceDAO: IReportTraceDAO;

  get traceDAO(): IReportTraceDAO {
    return this._traceDAO;
  }

  get jaegerTracer(): JaegerTracer {
    return this._jaegerTracer;
  }

  constructor(args: { jaegerTracer: JaegerTracer; traceDAO: IReportTraceDAO }) {
    this._jaegerTracer = args.jaegerTracer;
    this._traceDAO = args.traceDAO;
  }

  execute(args: {
    nameOperation: string;
    entityTraceInfo: { eType: string; eId: string };
  }): PromiseB<Span> {
    return PromiseB.try(() => {
      return this.getTrace({
        entityTraceInfo: {
          ...args.entityTraceInfo,
        },
      });
    }).then((trace: TraceDTO) => {
      return this.getSpan({
        nameOperation: args.nameOperation,
        trace: trace,
      });
    });
  }

  protected getTrace(args: {
    entityTraceInfo: { eType: string; eId: string };
  }): PromiseB<TraceDTO> {
    return this.traceDAO.findByEntityTraceInfo({
      eType: args.entityTraceInfo.eType,
      eId: args.entityTraceInfo.eId,
    });
  }

  protected getSpan(args: {
    nameOperation: string;
    trace: TraceDTO;
  }): PromiseB<Span> {
    return PromiseB.try(() => {
      return this.getParenSpanContext({ trace: args.trace });
    }).then((parentSpanContext: SpanContext | undefined) => {
      return this.getSpanFromParenSpanContext({
        nameOperation: args.nameOperation,
        parentSpanContext: parentSpanContext,
      });
    });
  }

  protected getParenSpanContext(args: {
    trace: TraceDTO;
  }): PromiseB<SpanContext | undefined> {
    const parentSpanContext: SpanContext | null = this.jaegerTracer.extract(
      FORMAT_HTTP_HEADERS,
      args.trace.trace
    );
    return PromiseB.try(() => {
      return parentSpanContext ?? undefined;
    });
  }

  protected getSpanFromParenSpanContext(args: {
    nameOperation: string;
    parentSpanContext: SpanContext | undefined;
  }): PromiseB<Span> {
    return new ServiceGetSpanFromParentSpanContext({
      jaegerTracer: this.jaegerTracer,
    }).execute({
      nameOperation: args.nameOperation,
      parentSpanContext: args.parentSpanContext,
    });
  }
}
