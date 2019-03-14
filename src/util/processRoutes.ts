import { Express, RequestHandler, Router } from 'express';
import apiHandler from '../middleware/api-handler';
import reAuthHandler from '../middleware/re-auth-handler';
import ApiRoute from '../struct/ApiRoute';
import Client from '../struct/Client';
import Route from '../struct/Route';

export default async function processRoutes (router: Router | Express, data: IData) {
  for (const route of data.routes) {
    const file: Route = new (require(`${data.directory}/${route}`).default)();

    if (!file.method) {
      this.util.logger.error(`Missing Method: Route ${route} was not initialised.`);

      continue;
    }

    file.server = this;
    file.client = data.client;
    Object.assign(file.util, { ...this.client.util });

    const mainHandler: RequestHandler = async (req, res, next) => {
      try {
        await file.exec(req, res, next);

        return true;
      } catch (err) {
        return file instanceof ApiRoute
          ? this.util.handleApiError(res, err)
          : this.util.handleSiteError(res, err);
      }
    };

    router[file.method.toLowerCase()](file.route, data.handler.bind(this, file)(), mainHandler);

    this.util.logger.info(
      `Loaded Route ${file.method.toUpperCase()} /${route} (id: ${file.id}, routes: ${file.route})`,
    );
  }

  return true;
}

/**
 * Data to pass on Routes
 */
interface IData {
  directory: string;
  routes: string[];
  client: Client;
  handler?: typeof reAuthHandler | typeof apiHandler;
}
