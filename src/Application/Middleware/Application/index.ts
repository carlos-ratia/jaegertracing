import { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import { FORMAT_HTTP_HEADERS } from "opentracing";
import { CONTAINER_ENTRY_IDENTIFIER } from "../../Dependencies";
import { ContainerInterface } from "../../Interface/ContainerInterface";
import { JaegerTracer } from "jaeger-client";

const MiddlewareApplicationManager = (
  app: Application,
  container: ContainerInterface
) => {
  const middleware: any[] = [
    compression(),
    cors({ origin: /^https:\/\/(.*)\.(bunkerdb|eagle-latam)\.com$/ }),
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    helmet(),
    // morgan(
    //     ":remote-addr - :remote-user [:date] :method :url HTTP/:http-version :status :res[content-length] :referrer :user-agent [:response-time ms]"
    // ),
    (req: Request, res: Response, next: NextFunction) => {
      const tracer: JaegerTracer = container.get(
        CONTAINER_ENTRY_IDENTIFIER.JaegerTracer
      );
      const parentSpanContext = tracer.extract(
        FORMAT_HTTP_HEADERS,
        req.headers
      );
      res.locals = {
        ...res.locals,
        parentSpanContext: parentSpanContext,
      };
      next();
    },
  ];
  middleware.forEach((mw) => {
    app.use(mw);
  });
};

export { MiddlewareApplicationManager };
