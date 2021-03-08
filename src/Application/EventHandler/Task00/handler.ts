import dotEnv from "dotenv";
import _ from "lodash";
import PromiseB from "bluebird";

import { EachMessagePayload, Kafka, logLevel } from "kafkajs";
import { KafkaMessageTask00DTO } from "../../../Domain/DTO/KafkaMessageTask00DTO";
import { KafkaMessageTask00Map } from "../../../Domain/Mappers/KafkaMessageTask00Map";
import { PrismaClientDBAL } from "../../../Infraestructure/DBAL/PrismaClientDBAL";
import { Trace } from "@prisma/client";
import {JaegerTracer} from "jaeger-client";
import {CONTAINER_ENTRY_IDENTIFIER, DependenciesManager} from "../../Dependencies";
import {FORMAT_HTTP_HEADERS, Span, Tags, SpanContext} from "opentracing";
import {ContainerBuilder} from "../../Container/ContainerBuilder";
import {ContainerInterface} from "../../Interface/ContainerInterface";


dotEnv.config();

_.forIn(
  {
    KAFKA_LOGLEVEL: process.env.KAFKA_LOGLEVEL,
    KAFKA_ADVERTISED_HOST_NAME: process.env.KAFKA_ADVERTISED_HOST_NAME,
    KAFKA_PORT: process.env.KAFKA_PORT,
  },
  (value, key) => {
    if (value === undefined || value === null || _.isEmpty(value)) {
      console.error(`The ${key} is no define in the .env`);
      process.exit(1);
    }
  }
);

const errorTypes: string[] = ["unhandledRejection", "uncaughtException"];
const signalTraps: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGUSR2"];
const broker: string = `${process.env.KAFKA_ADVERTISED_HOST_NAME}:${process.env.KAFKA_PORT}`;

const kafka = new Kafka({
  logLevel: (process.env.KAFKA_LOGLEVEL as unknown) as logLevel,
  brokers: [broker],
  clientId: "Kafka-clientId-1",
});

const topic: string = "jaeger-db.db_test.report";
const consumer = kafka.consumer({ groupId: "test" });

const containerBuilder = new ContainerBuilder();

//TODO
//SET-UP SETTINGS
//SettingsManager(containerBuilder)

//SET-UP DEPENDENCIES
DependenciesManager(containerBuilder);

//Build DI Container instance
const container: ContainerInterface = containerBuilder.build();

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      PromiseB.try(() => {
        return new KafkaMessageTask00Map().execute({
          buffer: payload.message.value,
        });
      })
        .then((message: KafkaMessageTask00DTO) => {
          return PrismaClientDBAL.getInstance()
            .trace.findUnique({
              rejectOnNotFound: true,
              where: {
                idxInsert: {
                  eType: "Report",
                  eId: message.after.id,
                },
              },
            })
            .then((trace: Trace) => {
              return { message, trace };
            });
        })
        .then((state: { message: KafkaMessageTask00DTO; trace: Trace }) => {
          const tracer: JaegerTracer = container.get(
              CONTAINER_ENTRY_IDENTIFIER.JaegerTracer
          );
          const parentSpanContext: SpanContext | null = tracer.extract(
              FORMAT_HTTP_HEADERS,
              state.trace.trace
          );
          const span: Span = tracer.startSpan("handler_task_00", {
            childOf: parentSpanContext ?? undefined,
            tags: { [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER },
          });
          span.log({
            event: "start",
            value: state,
          });
          span.setTag(Tags.HTTP_STATUS_CODE, 200);
          span.finish();
        })
        .catch((error) => {
          console.error(error);
        });
    },
  });
};

run().catch((e) => console.error(`[ERROR] ${e.message}`, e));

errorTypes.map((type: string) => {
  process.on(type, async (e) => {
    try {
      console.log(`process.on ${type}`);
      console.error(e);
      await consumer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.map((type: NodeJS.Signals) => {
  process.once(type, async () => {
    try {
      console.log(`signal traps ${type}`);
      await consumer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
