import { ReportPrismaAdapter } from "../../Infraestructure/DBAL/ReportPrismaAdapter";
import { PrismaClientDBAL } from "../../Infraestructure/DBAL/PrismaClientDBAL";
import { initTracer, TracingConfig, TracingOptions } from "jaeger-client";
import { ContainerInterface } from "../Interface/ContainerInterface";
import { ContainerBuilder } from "../Container/ContainerBuilder";
import { EventManager } from "../../Infraestructure/Event/EventManager";
import { ReportTracePrismaAdapter } from "../../Infraestructure/DBAL/ReportTracePrismaAdapter";
import { ReportTask00PrismaAdapter } from "../../Infraestructure/DBAL/ReportTask00PrismaAdapter";
import { ReportTask10PrismaAdapter } from "../../Infraestructure/DBAL/ReportTask10PrismaAdapter";
import { WinstonLoggerInstance } from "../../Infraestructure/Logger/WinstonLogger";
import { LoggerInterface } from "../../Infraestructure/Interface/LoggerInterface";
import { Kafka, logLevel } from "kafkajs";
import { ISettings } from "../Setting";

const CONTAINER_ENTRY_IDENTIFIER = {
  Settings: Symbol.for("Settings"),
  IEventManager: Symbol.for("IEventManager"),
  IReportDAO: Symbol.for("IReportDAO"),
  IReportTask00DAO: Symbol.for("IReportTask00DAO"),
  IReportTask10DAO: Symbol.for("IReportTask10DAO"),
  ITraceDAO: Symbol.for("ITraceDAO"),
  JaegerTracer: Symbol.for("JaegerTracer"),
  LoggerInterface: Symbol.for("LoggerInterface"),
  Kafka: Symbol.for("Kafka"),
};

const DependenciesManager = (containerBuilder: ContainerBuilder) => {
  containerBuilder.addDefinitions([
    {
      key: CONTAINER_ENTRY_IDENTIFIER.LoggerInterface,
      value: (_container: ContainerInterface) => {
        return WinstonLoggerInstance;
      },
    },
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
        return new ReportTracePrismaAdapter({
          adapter: PrismaClientDBAL.getInstance(),
        });
      },
    },
    {
      key: CONTAINER_ENTRY_IDENTIFIER.IReportTask00DAO,
      value: (_container: ContainerInterface) => {
        return new ReportTask00PrismaAdapter({
          adapter: PrismaClientDBAL.getInstance(),
        });
      },
    },
    {
      key: CONTAINER_ENTRY_IDENTIFIER.IReportTask10DAO,
      value: (_container: ContainerInterface) => {
        return new ReportTask10PrismaAdapter({
          adapter: PrismaClientDBAL.getInstance(),
        });
      },
    },
    {
      key: CONTAINER_ENTRY_IDENTIFIER.JaegerTracer,
      value: (container: ContainerInterface) => {
        const _logger: LoggerInterface = container.get(
          CONTAINER_ENTRY_IDENTIFIER.LoggerInterface
        );
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
              _logger.info({ message: msg });
            },
            error(msg: string) {
              _logger.error({ error: msg });
            },
          },
        };
        return initTracer(config, options);
      },
    },
    {
      key: CONTAINER_ENTRY_IDENTIFIER.Kafka,
      value: (container: ContainerInterface) => {
        const settings: ISettings = container.get(
          CONTAINER_ENTRY_IDENTIFIER.Settings
        );
        const broker: string = `${settings.KAFKA_ADVERTISED_HOST_NAME}:${settings.KAFKA_PORT}`;
        return new Kafka({
          logLevel: (settings.KAFKA_LOGLEVEL as unknown) as logLevel,
          brokers: [broker],
          clientId: "Kafka-clientId-1",
        });
      },
    },
  ]);
};

export { DependenciesManager, CONTAINER_ENTRY_IDENTIFIER };
