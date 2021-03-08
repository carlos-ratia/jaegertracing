import { NextFunction, Request, Response } from "express";
import PromiseB from "bluebird";
import { Span, Tags } from "opentracing";
import { IAction } from "../Interface/IAction";
import { CONTAINER_ENTRY_IDENTIFIER } from "../Dependencies";
import { ContainerInterface } from "../Interface/ContainerInterface";
import { JaegerTracer } from "jaeger-client";

export abstract class ActionBase implements IAction {
  private readonly _container: ContainerInterface;

  get container(): ContainerInterface {
    return this._container;
  }

  protected constructor(args: { container: ContainerInterface }) {
    this._container = args.container;
  }

  call = (req: Request, res: Response, next: NextFunction): PromiseB<void> => {
    const tracer: JaegerTracer = this.container.get(
      CONTAINER_ENTRY_IDENTIFIER.JaegerTracer
    );
    const span: Span = tracer.startSpan("http_server", {
      childOf: res.locals.parentSpanContext,
      tags: { [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER },
    });
    return PromiseB.try(() => {
      return this.doCall(req, res, span);
    })
      .then((result: any) => {
        span.log({
          event: this.constructor.name,
          value: result,
        });
        return result;
      })
      .then((result: any) => {
        this.postDoCall(res, result);
      })
      .then(() => {
        span.setTag(Tags.HTTP_STATUS_CODE, 200);
        span.finish();
      })
      .catch((error: any) => {
        //MANEJO DE ERROR
        //const error = ActionErrorFactory.create(reject, req, res);
        span.setTag(Tags.ERROR, true);
        span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
        span.log({
          event: "error",
          "error.object": error,
        });
        span.finish();
        next(error);
      });
  };

  protected abstract doCall(
    req: Request,
    res: Response,
    span: Span
  ): PromiseB<any>;

  protected postDoCall(res: Response, result: any): void {
    res.status(200).json({
      statusCode: 200,
      data: result,
    });
  }
}
