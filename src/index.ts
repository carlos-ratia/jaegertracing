import express, { Application, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import dotEnv, { DotenvConfigOutput } from "dotenv";
import _ from "lodash";
import { RouteManager } from "./Application/Route";
import { DependenciesManager } from "./Application/Dependencies";
import { MiddlewareApplicationManager } from "./Application/Middleware/Application";
import { ContainerBuilder } from "./Application/Container/ContainerBuilder";
import { ContainerInterface } from "./Application/Interface/ContainerInterface";
import { EventDomainManager } from "./Application/EventHandler";

const config: DotenvConfigOutput = dotEnv.config();

if (config.error !== undefined) {
  console.error(config.error);
  process.exit(1);
}

_.forIn(
  {
    SERVER_PORT: process.env.SERVER_PORT,
    DSN: process.env.DSN,
  },
  (value: string | undefined, key: string) => {
    if (value === undefined || value === null || _.isEmpty(value)) {
      console.error(`The ${key} is no define in the .env`);
      process.exit(1);
    }
  }
);

const app: Application = express();
const port: number = parseInt(process.env.SERVER_PORT ?? "5000");
const containerBuilder = new ContainerBuilder();

//TODO
//SET-UP SETTINGS
//SettingsManager(containerBuilder)

//SET-UP DEPENDENCIES
DependenciesManager(containerBuilder);

//Build DI Container instance
const container: ContainerInterface = containerBuilder.build();

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
  console.error(error);
  res.status(error.status ?? 500).json({ error });
});

app.listen(port, () => {
  console.log(
    " App is running at http://localhost:%d in %s mode",
    port,
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});
