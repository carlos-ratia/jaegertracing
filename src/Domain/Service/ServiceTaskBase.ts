import { ContainerInterface } from "../../Application/Interface/ContainerInterface";
import PromiseB from "bluebird";
import { Span, Tags } from "opentracing";
import { ReportDTO } from "../DTO/ReportDTO";
import { KafkaMessage } from "kafkajs";
import { ServiceSaveTraceBySpanAndEntityInfo } from "./ServiceSaveTraceBySpanAndEntityInfo";
import { ReportTraceDAO } from "../Repository/ReportTraceDAO";
import { CONTAINER_ENTRY_IDENTIFIER } from "../../Application/Dependencies";
import { TraceDTO } from "../DTO/TraceDTO";
import { ServiceGetSpanFromTrace } from "./ServiceGetSpanFromTrace";
import { SpanNull } from "../Models/SpanNull";
import { ErrorNoTracing } from "../Error/ErrorNoTracing";
import { BadMethodCallException } from "../Error/BadMethodCallException";
import { ReportDAO } from "../Repository/ReportDAO";

export abstract class ServiceTaskBase<T, Q, R> {
  private readonly _container: ContainerInterface;
  private _message: T | undefined;
  private _report: ReportDTO | undefined;
  private _span: Span | SpanNull | undefined;

  get container(): ContainerInterface {
    return this._container;
  }

  get message(): T {
    if (this._message === undefined) {
      throw new BadMethodCallException(
        `Error in the ${this.constructor.name}::message -> The message is undefined.`
      );
    }
    return this._message;
  }

  set message(value: T) {
    this._message = value;
  }

  set span(value: Span | SpanNull) {
    this._span = value;
  }

  get span(): Span | SpanNull {
    if (this._span === undefined) {
      throw new BadMethodCallException(
        `Error in the ${this.constructor.name}::span -> The Span is undefined.`
      );
    }
    return this._span;
  }

  get report(): ReportDTO {
    if (this._report === undefined) {
      throw new BadMethodCallException(
        `Error in the ${this.constructor.name}::span -> The Span is undefined.`
      );
    }
    return this._report;
  }

  set report(value: ReportDTO) {
    this._report = value;
  }

  protected constructor(args: { container: ContainerInterface }) {
    this._container = args.container;
  }

  execute(args: { kafkaMessage: KafkaMessage }): PromiseB<void> {
    return PromiseB.try(() => {
      return this.getMessage({ kafkaMessage: args.kafkaMessage });
    })
      .then((message: T) => {
        this.message = message;
      })
      .then(() => {
        return this.getReportDTO();
      })
      .then((report: ReportDTO) => {
        this.report = report;
      })
      .then(() => {
        return this.getSpan();
      })
      .then((span: Span) => {
        this.span = span;
      })
      .then(() => {
        this.span.log({
          event: `start-${this.constructor.name}`,
          value: { message: this.message, result: {} },
        });
      })
      .then(() => {
        return this.task();
      })
      .then((result: Q) => {
        return this.next({ data: result });
      })
      .then(() => {
        return this.saveTrace();
      })
      .then(() => {
        this.span.log({
          event: `finish-${this.constructor.name}`,
          value: { message: this.message, result: {} },
        });
      })

      .then(() => {
        this.span.setTag(Tags.HTTP_STATUS_CODE, 200);
        this.span.finish();
      })
      .catch((error) => {
        this.span.setTag(Tags.ERROR, true);
        this.span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
        this.span.log({
          event: "error",
          "error.object": error,
        });
        this.span.finish();
        return this.handleError(error);
      });
  }

  protected abstract getMessage(args: {
    kafkaMessage: KafkaMessage;
  }): PromiseB<T>;

  protected getReportDTO(): PromiseB<ReportDTO> {
    return PromiseB.try(() => {
      return this.getReportId();
    }).then((reportId: string) => {
      return new ReportDAO({
        adapter: this.container.get(CONTAINER_ENTRY_IDENTIFIER.IReportDAO),
      }).findById({
        id: reportId,
      });
    });
  }

  protected abstract getReportId(): PromiseB<string>;

  protected getSpan(): PromiseB<Span> {
    return PromiseB.try(() => {
      return new ServiceGetSpanFromTrace({
        jaegerTracer: this.container.get(
          CONTAINER_ENTRY_IDENTIFIER.JaegerTracer
        ),
        traceDAO: this.container.get(CONTAINER_ENTRY_IDENTIFIER.ITraceDAO),
      }).execute({
        nameOperation: this.constructor.name,
        entityTraceInfo: this.getTraceEntityInfo(),
      });
    })
      .then((span: Span) => {
        return span.setTag(Tags.SPAN_KIND_MESSAGING_CONSUMER, true);
      })
      .catch((_) => {
        return new SpanNull();
      });
  }

  protected task(): PromiseB<Q> {
    return PromiseB.try(() => {
      this.span.log({
        event: `start-${this.constructor.name}-task`,
        value: { message: this.message, result: {} },
      });
    })
      .then(() => {
        return this.doTask();
      })
      .then((result: Q) => {
        this.span.log({
          event: `finish-${this.constructor.name}-task`,
          value: { message: this.message, result: { result } },
        });
        return result;
      });
  }

  protected abstract doTask(): PromiseB<Q>;

  protected next(args: { data: Q }): PromiseB<void> {
    return PromiseB.try(() => {
      this.span.log({
        event: `start-${this.constructor.name}-next`,
        value: { message: this.message, result: {} },
      });
    })
      .then(() => {
        return this.doNext({ data: args.data });
      })
      .then((dto: R) => {
        this.span.log({
          event: `finish-${this.constructor.name}-next`,
          value: { message: this.message, result: dto },
        });
      });
  }

  protected abstract doNext(args: { data: Q }): PromiseB<R>;

  protected saveTrace(): PromiseB<void> {
    return PromiseB.try(() => {
      this.span.log({
        event: `start-${this.constructor.name}-trace`,
        value: { message: this.message, result: {} },
      });
    })
      .then(() => {
        return this.doSaveTrace();
      })
      .then((dto: TraceDTO) => {
        this.span.log({
          event: `finish-${this.constructor.name}-trace`,
          value: { message: this.message, result: dto },
        });
      })
      .catch((error) => {
        if (error instanceof ErrorNoTracing) {
          return;
        }
        throw error;
      });
  }

  /**
   *
   * @throws ErrorNoTracing
   */
  protected doSaveTrace(): PromiseB<TraceDTO> {
    if (this.span instanceof SpanNull) {
      throw new ErrorNoTracing();
    }
    return PromiseB.try(() => {
      return this.getNextEntityInfo();
    }).then((entityInfo: { eId: string; eType: string }) => {
      return new ServiceSaveTraceBySpanAndEntityInfo({
        traceDAO: new ReportTraceDAO({
          adapter: this.container.get(CONTAINER_ENTRY_IDENTIFIER.ITraceDAO),
        }),
        jaegerTracer: this.container.get(
          CONTAINER_ENTRY_IDENTIFIER.JaegerTracer
        ),
      }).execute({
        span: this.span,
        entityInfo: {
          eId: entityInfo.eId,
          eType: entityInfo.eType,
        },
      });
    });
  }

  public getTraceEntityInfo(): { eId: string; eType: string } {
    return {
      eId: this.getEId(),
      eType: this.getEType(),
    };
  }

  protected abstract getEId(): string;

  protected abstract getEType(): string;

  protected abstract getNextEntityInfo(): PromiseB<{
    eId: string;
    eType: string;
  }>;

  protected handleError(error: any): PromiseB<void> {
    return PromiseB.try(() => {
      console.error(error);
    });
  }
}
