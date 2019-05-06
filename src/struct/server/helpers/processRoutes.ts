import { Express, RequestHandler, Router } from 'express';
import Server from '..';
import { IRouterData } from '../../../../typings';
import ApiRoute from '../../ApiRoute';
import Route from '../../Route';

export default async function processRoutes (this: Server, router: Router | Express, data: IRouterData) {
  for (const route of data.routes) {
    const file: Route = new (require(`${data.directory}/${route}`).default)();

    if (!file.method) {
      this.util.logger.error(`Missing Method: Route ${route} was not initialised.`);

      continue;
    }

    file.server = this;
    file.client = data.client;

    const mainHandler: RequestHandler = async (req, res, next) => {
      try {
        await file.exec(req, res, next);

        return true;
      } catch (err) {
        return file instanceof ApiRoute
          ? this.util.handleApiError.call(this, res, err)
          : this.util.handleSiteError.call(this, res, err);
      }
    };

    router[file.method.toLowerCase()](file.route, data.handler.bind(this, file)(), mainHandler);

    this.util.logger.info(
      `Loaded Route ${file.method.toUpperCase()} /${route} (id: ${file.id}, routes: ${file.route})`
    );
  }

  return true;
}
