import { NextFunction, Request, Response } from "express";
import PromiseB from "bluebird";
import { Span, Tags } from "opentracing";
import { IAction } from "../Interface/IAction";
import { CONTAINER_ENTRY_IDENTIFIER } from "../Dependencies";
import { ContainerInterface } from "../Interface/ContainerInterface";
import { ServiceGetSpanFromParentSpanContext } from "../../Domain/Service/ServiceGetSpanFromParentSpanContext";

export abstract class ActionBase implements IAction {
  private readonly _container: ContainerInterface;

  get container(): ContainerInterface {
    return this._container;
  }

  protected constructor(args: { container: ContainerInterface }) {
    this._container = args.container;
  }

  call = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const span: Span = await new ServiceGetSpanFromParentSpanContext({
      jaegerTracer: this.container.get(CONTAINER_ENTRY_IDENTIFIER.JaegerTracer),
    }).execute({
      nameOperation: "HttpServer",
      parentSpanContext: res.locals.parentSpanContext,
    });
    span.setTag(Tags.SPAN_KIND_MESSAGING_PRODUCER, true);

    return PromiseB.try(() => {
      span.log({
        event: "start",
        value: {
          action: this.constructor.name,
        },
      });
    })
      .then(() => {
        return this.doCall(req, res, span);
      })
      .then((result: any) => {
        span.log({
          event: "finish",
          value: {
            action: this.constructor.name,
            result: result,
          },
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
