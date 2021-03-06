import PromiseB from "bluebird";
import { TraceDTO } from "../DTO/TraceDTO";
import { FORMAT_HTTP_HEADERS, Span } from "opentracing";
import { JaegerTracer } from "jaeger-client";
import { IReportTraceDAO } from "../Interface/IReportTraceDAO";

export class ServiceSaveTraceBySpanAndEntityInfo {
  private readonly _jaegerTracer: JaegerTracer;
  private readonly _traceDAO: IReportTraceDAO;

  get jaegerTracer(): JaegerTracer {
    return this._jaegerTracer;
  }

  get traceDAO(): IReportTraceDAO {
    return this._traceDAO;
  }

  constructor(args: { jaegerTracer: JaegerTracer; traceDAO: IReportTraceDAO }) {
    this._jaegerTracer = args.jaegerTracer;
    this._traceDAO = args.traceDAO;
  }

  execute(args: {
    span: Span;
    entityInfo: { eType: string; eId: string };
  }): PromiseB<TraceDTO> {
    return PromiseB.try(() => {
      const headersCarrier = {};
      this.jaegerTracer.inject(args.span, FORMAT_HTTP_HEADERS, headersCarrier);
      return headersCarrier;
    })
      .then((headersCarrier) => {
        return this.traceDAO.create({
          data: {
            eType: args.entityInfo.eType,
            eId: args.entityInfo.eId,
            trace: headersCarrier,
          },
        });
      })
      .then((dto) => {
        return dto;
      });
  }
}
