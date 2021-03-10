import dotEnv from "dotenv";
import _ from "lodash";
import PromiseB from "bluebird";
import { EachMessagePayload, Kafka, logLevel } from "kafkajs";
import { DependenciesManager } from "../../Dependencies";
import { ContainerBuilder } from "../../Container/ContainerBuilder";
import { ContainerInterface } from "../../Interface/ContainerInterface";
import {ServiceTask10} from "../../../Domain/Service/ServiceTask10";

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

const topic: string = "jaeger-db.db_test.reporttask00";
const consumer = kafka.consumer({ groupId: "ReportTask10" });

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
    eachMessage: async (payload: EachMessagePayload): Promise<void> => {
      return PromiseB.try(() => {
        return new ServiceTask10({
          container: container,
        }).execute({
          kafkaMessage: payload.message,
        });
      }).catch((error) => {
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
