import { ActionBase } from "./ActionBase";
import { Request, Response } from "express";
import PromiseB from "bluebird";
import { ReportDAO } from "../../Domain/Repository/ReportDAO";
import { CONTAINER_ENTRY_IDENTIFIER } from "../Dependencies";
import { ContainerInterface } from "../Interface/ContainerInterface";
import { Span } from "opentracing";
import { ReportDTO } from "../../Domain/DTO/ReportDTO";
import { ServiceSaveTraceBySpanAndEntityInfo } from "../../Domain/Service/ServiceSaveTraceBySpanAndEntityInfo";
import { ReportTraceDAO } from "../../Domain/Repository/ReportTraceDAO";

export class CreateReport extends ActionBase {
  constructor(args: { container: ContainerInterface }) {
    super(args);
  }

  protected doCall(
    req: Request,
    _res: Response,
    span: Span
  ): PromiseB<ReportDTO> {
    return new ReportDAO({
      adapter: this.container.get(CONTAINER_ENTRY_IDENTIFIER.IReportDAO),
    })
      .create({
        data: {
          payload: req.body,
        },
      })
      .then((dto) => {
        return PromiseB.try(() => {
          return new ServiceSaveTraceBySpanAndEntityInfo({
            traceDAO: new ReportTraceDAO({
              adapter: this.container.get(CONTAINER_ENTRY_IDENTIFIER.ITraceDAO),
            }),
            jaegerTracer: this.container.get(
              CONTAINER_ENTRY_IDENTIFIER.JaegerTracer
            ),
          }).execute({
            span: span,
            entityInfo: {
              eId: dto.id,
              eType: "Report",
            },
          });
        }).then(() => {
          return dto;
        });
      });
  }
}
