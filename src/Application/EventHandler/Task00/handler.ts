import dotEnv from "dotenv";
import PromiseB from "bluebird";
import { EachMessagePayload, Kafka } from "kafkajs";
import {
  CONTAINER_ENTRY_IDENTIFIER,
  DependenciesManager,
} from "../../Dependencies";
import { ContainerBuilder } from "../../Container/ContainerBuilder";
import { ContainerInterface } from "../../Interface/ContainerInterface";
import { ServiceTask00 } from "../../../Domain/Service/ServiceTask00";
import { LoggerInterface } from "../../../Infraestructure/Interface/LoggerInterface";

dotEnv.config();

const containerBuilder = new ContainerBuilder();

//TODO
//SET-UP SETTINGS
//SettingsManager(containerBuilder)

//SET-UP DEPENDENCIES
DependenciesManager(containerBuilder);

//Build DI Container instance
const container: ContainerInterface = containerBuilder.build();
const logger: LoggerInterface = container.get(
  CONTAINER_ENTRY_IDENTIFIER.LoggerInterface
);

const kafka: Kafka = container.get(CONTAINER_ENTRY_IDENTIFIER.Kafka);
const topic: string = "jaeger-db.db_test.report";
const consumer = kafka.consumer({ groupId: "ReportTask00" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async (payload: EachMessagePayload): Promise<void> => {
      return PromiseB.try(() => {
        return new ServiceTask00({
          container: container,
        }).execute({
          kafkaMessage: payload.message,
        });
      }).catch((error) => {
        logger.error(error);
      });
    },
  });
};

run().catch((error) => logger.error({ error: error }));

const errorTypes: string[] = ["unhandledRejection", "uncaughtException"];
const signalTraps: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.map((type: string) => {
  process.on(type, async (e) => {
    try {
      logger.info({ message: `process.on ${type}` });
      logger.error(e);
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
      logger.info({ message: `signal traps ${type}` });
      await consumer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
