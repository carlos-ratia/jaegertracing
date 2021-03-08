import { IRoute, RouteMethodsType } from "../Interface/IRoute";
import { CreateReport } from "../Action/CreateReport";
import { Application, NextFunction, Request, Response } from "express";
import { IRouteMiddleware } from "../Interface/IRouteMiddleware";
import { IAction } from "../Interface/IAction";
import _ from "lodash";
import { ContainerInterface } from "../Interface/ContainerInterface";

const RouteManager = (app: Application, container: ContainerInterface) => {
  const routes: IRoute[] = [
    {
      method: RouteMethodsType.POST,
      pattern: "/reports",
      action: new CreateReport({ container: container }),
      middleware: [],
    },
  ];
  routes.forEach((route: IRoute) => {
    switch (route.method) {
      case RouteMethodsType.GET:
        app.get(route.pattern, getHandlerByRoute(route));
        break;
      case RouteMethodsType.POST:
        app.post(route.pattern, getHandlerByRoute(route));
        break;
      case RouteMethodsType.PUT:
        app.put(route.pattern, getHandlerByRoute(route));
        break;
      case RouteMethodsType.DELETE:
        app.delete(route.pattern, getHandlerByRoute(route));
        break;
      default:
        throw new Error(
          `Error in the Routes.setHandler(...) -> Method ${route.method.toString()} is not supported. ${JSON.stringify(
            route
          )}`
        );
    }
  });
};

const getHandlerByRoute = (
  route: IRoute
): ((req: Request, res: Response, next: NextFunction) => void)[] => {
  const mws: IRouteMiddleware[] | undefined = route.middleware;
  if (!_.isUndefined(mws) && _.isArray(mws) && mws.length > 0) {
    return getHandlerByRouteWithMiddleware(mws, route.action);
  } else {
    return [getHandlerByRouteWithoutMiddleware(route.action)];
  }
};

const getHandlerByRouteWithMiddleware = (
  mws: IRouteMiddleware[],
  action: IAction
): ((req: Request, res: Response, next: NextFunction) => void)[] => {
  const handler = [];
  mws.forEach((mw: IRouteMiddleware) => {
    handler.push(mw.call);
  });
  handler.push(getHandlerByRouteWithoutMiddleware(action));
  return handler;
};

const getHandlerByRouteWithoutMiddleware = (
  action: IAction
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return asyncMiddleware(action.call);
};

const asyncMiddleware = (wrap: {
  (req: Request, res: Response, next: NextFunction): void;
}) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(wrap(req, res, next)).catch(next);
};

export { RouteManager };
