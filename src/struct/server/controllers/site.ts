import { Router } from 'express';
import * as fs from 'fs-extra';
import { resolve } from 'path';
import Server from '..';
import reAuthHandler from '../../../middleware/re-auth-handler';
import processRoutes from '../helpers/processRoutes';

export default {
  async init (this: Server) {
    const router = Router();
    const SITE_ROUTES_DIR: string = resolve(__dirname, '../../../routes/site');
    let siteRoutes: string[] = fs.readdirSync(SITE_ROUTES_DIR);
    siteRoutes = siteRoutes.filter(el => el !== 'api');

    await processRoutes.call(
      this,
      router,
      { client: this.client, directory: SITE_ROUTES_DIR, handler: reAuthHandler, routes: siteRoutes }
    );

    router.all('*', (_, res) => this.util.handleSiteError.call(this, res, { code: 404 }));
    this.util.logger.info('Loaded Site Routes');

    return router;
  }
};
