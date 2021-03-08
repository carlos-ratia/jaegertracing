import { ActionBase } from "./ActionBase";
import { Request, Response } from "express";
import PromiseB from "bluebird";
import { ReportDAO } from "../../Domain/Repository/ReportDAO";
import { CONTAINER_ENTRY_IDENTIFIER } from "../Dependencies";
import { ContainerInterface } from "../Interface/ContainerInterface";
import { Span } from "opentracing";
import { ReportDTO } from "../../Domain/DTO/ReportDTO";
import { IEventManager } from "../../Domain/Interface/IEventManager";
import { EVENT_DOMAIN_IDENTIFIER } from "../EventHandler";

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
        const eventManager: IEventManager = this.container.get(
          CONTAINER_ENTRY_IDENTIFIER.IEventManager
        );
        eventManager.emit({
          eventDTO: {
            eventId: EVENT_DOMAIN_IDENTIFIER.EVENT_TRACE_CREATE,
            payload: {
              span: span,
              eType: "Report",
              eId: dto.id,
            },
            ts_ms: Date.now(),
          },
        });
        return dto;
      });
  }
}
