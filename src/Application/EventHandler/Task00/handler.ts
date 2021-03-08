import dotEnv from "dotenv";
import _ from "lodash";
import PromiseB from "bluebird";
import { EachMessagePayload, Kafka, logLevel } from "kafkajs";
import { KafkaMessageTask00DTO } from "../../../Domain/DTO/KafkaMessageTask00DTO";
import { KafkaMessageTask00Map } from "../../../Domain/Mappers/KafkaMessageTask00Map";
import {
  CONTAINER_ENTRY_IDENTIFIER,
  DependenciesManager,
} from "../../Dependencies";
import { Span, Tags } from "opentracing";
import { ContainerBuilder } from "../../Container/ContainerBuilder";
import { ContainerInterface } from "../../Interface/ContainerInterface";
import { ServiceGetSpanFromTrace } from "../../../Domain/Service/ServiceGetSpanFromTrace";

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
      //MESSAGE
      const message: KafkaMessageTask00DTO = await new KafkaMessageTask00Map().execute(
        {
          buffer: payload.message.value,
        }
      );

      //SPAN
      const span: Span = await new ServiceGetSpanFromTrace({
        jaegerTracer: container.get(CONTAINER_ENTRY_IDENTIFIER.JaegerTracer),
        traceDAO: container.get(CONTAINER_ENTRY_IDENTIFIER.ITraceDAO),
      }).execute({
        nameOperation: "HandlerTask00",
        eInfo: {
          eType: "Report",
          eId: message.after.id,
        },
      });
      span.setTag(Tags.SPAN_KIND_MESSAGING_CONSUMER, true);

      //TASK
      PromiseB.try(() => {
        span.log({
          event: "start",
          value: { message: message, result: {} },
        });
      })
        .then(() => {
          //DO TASK
          //new ServiceTask00({...dependencies, span}).execute({message})
        })
        .then(() => {
          //NEXT
        })
        .then((result) => {
          span.log({
            event: "finish",
            value: { message: message, result: result },
          });
        })
        .then(() => {
          span.setTag(Tags.HTTP_STATUS_CODE, 200);
          span.finish();
        })
        .catch((error) => {
          span.setTag(Tags.ERROR, true);
          span.setTag(Tags.HTTP_STATUS_CODE, error.statusCode || 500);
          span.log({
            event: "error",
            "error.object": error,
          });
          span.finish();
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
