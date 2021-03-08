import { ContainerInterface } from "../Interface/ContainerInterface";
import { EventListenersDTO } from "../../Domain/DTO/EventListenersDTO";
import { CONTAINER_ENTRY_IDENTIFIER } from "../Dependencies";
import { IEventManager } from "../../Domain/Interface/IEventManager";
import PromiseB from "bluebird";
import { EventDTO } from "../../Domain/DTO/EventDTO";
import { ITraceDAO } from "../../Domain/Interface/ITraceDAO";
import { FORMAT_HTTP_HEADERS } from "opentracing";
import { JaegerTracer } from "jaeger-client";
import { TraceCreateInput } from "../../Domain/DTO/TraceCreateInput";

const EVENT_DOMAIN_IDENTIFIER = {
  EVENT_TRACE_CREATE: Symbol.for("EVENT_TRACE_CREATE"),
};

const EventDomainManager = (container: ContainerInterface) => {
  const eventListeners: EventListenersDTO[] = [
    {
      eventId: EVENT_DOMAIN_IDENTIFIER.EVENT_TRACE_CREATE,
      listener: (args: EventDTO): PromiseB<void> => {
        return PromiseB.try(() => {
          const tracer: JaegerTracer = container.get(
            CONTAINER_ENTRY_IDENTIFIER.JaegerTracer
          );
          const traceDAO: ITraceDAO = container.get(
            CONTAINER_ENTRY_IDENTIFIER.ITraceDAO
          );
          const headersCarrier = {};
          tracer.inject(args.payload.span, FORMAT_HTTP_HEADERS, headersCarrier);
          const traceCreateInput: TraceCreateInput = {
            eType: args.payload.eType,
            eId: args.payload.eId,
            trace: headersCarrier,
          };
          traceDAO
            .create({
              data: traceCreateInput,
            })
            .then((_) => {});
        });
      },
    },
  ];

  const eventManager: IEventManager = container.get(
    CONTAINER_ENTRY_IDENTIFIER.IEventManager
  );

  eventListeners.forEach((eventListener: EventListenersDTO) => {
    eventManager.on({
      eventListener: eventListener,
    });
  });
};

export { EventDomainManager, EVENT_DOMAIN_IDENTIFIER };
