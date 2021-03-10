import express, { Application, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { RouteManager } from "./Application/Route";
import {
  CONTAINER_ENTRY_IDENTIFIER,
  DependenciesManager,
} from "./Application/Dependencies";
import { MiddlewareApplicationManager } from "./Application/Middleware/Application";
import { ContainerBuilder } from "./Application/Container/ContainerBuilder";
import { ContainerInterface } from "./Application/Interface/ContainerInterface";
import { EventDomainManager } from "./Application/EventHandler";
import { LoggerInterface } from "./Infraestructure/Interface/LoggerInterface";
import * as http from "http";
import { ISettings, SettingsManager } from "./Application/Setting";

//SET-UP CONTAINER
const containerBuilder = new ContainerBuilder();

//SET-UP SETTINGS
SettingsManager(containerBuilder);

//SET-UP DEPENDENCIES
DependenciesManager(containerBuilder);

//Build DI Container instance
const container: ContainerInterface = containerBuilder.build();
const settings: ISettings = container.get(CONTAINER_ENTRY_IDENTIFIER.Settings);
const logger: LoggerInterface = container.get(
  CONTAINER_ENTRY_IDENTIFIER.LoggerInterface
);

const app: Application = express();
const port: number = parseInt(settings.SERVER_PORT.toString());

//REGISTER EVENSTDOMAIN
EventDomainManager(container);

//REGISTER MIDDLEWARE LEVEL APP
MiddlewareApplicationManager(app, container);

//REGISTER ROUTES
RouteManager(app, container);

//REGISTER MW HANDLE ROUTE NO FOUND
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createHttpError(404));
});

//MW APP ERROR HANDLER
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(error);
  res.status(error.status ?? 500).json({ error });
});

const server: http.Server = app.listen(port, () => {
  logger.info({
    message: `App is running at http://localhost:${port} ${app.get("env")}`,
  });
});

const errorTypes: string[] = ["unhandledRejection", "uncaughtException"];
const signalTraps: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.map((type: string) => {
  process.on(type, async (error) => {
    try {
      logger.info({ message: `process.on ${type}` });
      logger.error({ error: error ?? false });
      await server.close((err: Error | undefined) => {
        logger.error({ error: err ?? false });
      });
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
      await server.close((err: Error | undefined) => {
        logger.error({ error: err ?? false });
      });
    } finally {
      process.kill(process.pid, type);
    }
  });
});
