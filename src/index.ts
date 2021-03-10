import express, { Application, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import dotEnv, { DotenvConfigOutput } from "dotenv";
import _ from "lodash";
import { RouteManager } from "./Application/Route";
import {
  CONTAINER_ENTRY_IDENTIFIER,
  DependenciesManager,
} from "./Application/Dependencies";
import { MiddlewareApplicationManager } from "./Application/Middleware/Application";
import { ContainerBuilder } from "./Application/Container/ContainerBuilder";
import { ContainerInterface } from "./Application/Interface/ContainerInterface";
import { EventDomainManager } from "./Application/EventHandler";
import {
  LoggerInterface,
  LogLevels,
} from "./Infraestructure/Interface/LoggerInterface";

const config: DotenvConfigOutput = dotEnv.config();

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

if (config.error !== undefined) {
  logger.log(LogLevels.ERROR, config.error);
  process.exit(1);
}

_.forIn(
  {
    SERVER_PORT: process.env.SERVER_PORT,
    DSN: process.env.DSN,
  },
  (value: string | undefined, key: string) => {
    if (value === undefined || value === null || _.isEmpty(value)) {
      logger.log(LogLevels.ERROR, {
        error: `The ${key} is no define in the .env`,
      });
      process.exit(1);
    }
  }
);

const app: Application = express();
const port: number = parseInt(process.env.SERVER_PORT ?? "5000");

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

app.listen(port, () => {
  logger.info({
    message: `App is running at http://localhost:${port} ${app.get("env")}`,
  });
});
