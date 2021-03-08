import { ReportPrismaAdapter } from "../../Infraestructure/DBAL/ReportPrismaAdapter";
import { PrismaClientDBAL } from "../../Infraestructure/DBAL/PrismaClientDBAL";
import { initTracer, TracingConfig, TracingOptions } from "jaeger-client";
import { ContainerInterface } from "../Interface/ContainerInterface";
import { ContainerBuilder } from "../Container/ContainerBuilder";
import { EventManager } from "../../Infraestructure/Event/EventManager";
import { TracePrismaAdapter } from "../../Infraestructure/DBAL/TracePrismaAdapter";

const CONTAINER_ENTRY_IDENTIFIER = {
  Settings: Symbol.for("Settings"),
  IEventManager: Symbol.for("IEventManager"),
  IReportDAO: Symbol.for("IReportDAO"),
  ITraceDAO: Symbol.for("ITraceDAO"),
  JaegerTracer: Symbol.for("JaegerTracer"),
};

const DependenciesManager = (containerBuilder: ContainerBuilder) => {
  containerBuilder.addDefinitions([
    {
      key: CONTAINER_ENTRY_IDENTIFIER.IEventManager,
      value: (_container: ContainerInterface) => {
        return EventManager.getInstance();
      },
    },
    {
      key: CONTAINER_ENTRY_IDENTIFIER.IReportDAO,
      value: (_container: ContainerInterface) => {
        return new ReportPrismaAdapter({
          adapter: PrismaClientDBAL.getInstance(),
        });
      },
    },
    {
      key: CONTAINER_ENTRY_IDENTIFIER.ITraceDAO,
      value: (_container: ContainerInterface) => {
        return new TracePrismaAdapter({
          adapter: PrismaClientDBAL.getInstance(),
        });
      },
    },
    {
      key: CONTAINER_ENTRY_IDENTIFIER.JaegerTracer,
      value: (_container: ContainerInterface) => {
        const config: TracingConfig = {
          serviceName: "test",
          sampler: {
            type: "const",
            param: 1,
          },
          reporter: {
            logSpans: true,
          },
        };
        const options: TracingOptions = {
          logger: {
            info(msg: string) {
              console.log("INFO ", msg);
            },
            error(msg: string) {
              console.log("ERROR", msg);
            },
          },
        };
        return initTracer(config, options);
      },
    },
  ]);
};

export { DependenciesManager, CONTAINER_ENTRY_IDENTIFIER };
