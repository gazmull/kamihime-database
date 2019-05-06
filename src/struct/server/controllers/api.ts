import { Collection } from 'discord.js';
import { Router } from 'express';
import * as fs from 'fs-extra';
import { resolve } from 'path';
import Server from '..';
import apiHandler from '../../../middleware/api-handler';
import processRoutes from '../helpers/processRoutes';

export default {
  async init (this: Server) {
    const router = Router();
    const API_ROUTES_DIR: string = resolve(__dirname, '../../../routes/api');
    const methods: string[] = fs.readdirSync(API_ROUTES_DIR);

    for (const method of methods) {
        this.stores.rateLimits.set(method, new Collection());
        this.util.logger.info(`API: Ratelimiter: Method ${method.toUpperCase()}`);

        const API_METHOD_ROUTES_DIR = resolve(API_ROUTES_DIR, method);
        let apiRoutes: string[] = fs.readdirSync(API_METHOD_ROUTES_DIR);
        apiRoutes = apiRoutes.map(el => el.slice(0, el.indexOf('.js')));

        await processRoutes.call(
          this,
          router,
          { client: this.client, directory: API_METHOD_ROUTES_DIR, handler: apiHandler, routes: apiRoutes }
        );

        for (const route of apiRoutes) {
          this.stores.rateLimits.get(method).set(route, new Collection());
          this.util.logger.info(`-- ${route} Collection is set.`);
        }
      }

    router.all('*', (_, res) =>
      this.util.handleApiError.call(this, res, { code: 404, message: 'API method not found.' })
    );
    this.util.logger.info('Loaded API Routes');

    return router;
  }
};
