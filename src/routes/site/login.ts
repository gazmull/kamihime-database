import { pbkdf2 } from 'crypto';
import { Request, Response } from 'express';
import * as shortid from 'shortid';
import { IAdminUser } from '../../../typings';
import Route from '../../struct/Route';
import ApiError from '../../util/ApiError';

shortid.seed(11);

export default class LoginRoute extends Route {
  constructor () {
    super({
      id: 'login',
      method: 'all',
      route: [ '/login/:admin?/:verify?' ]
    });
  }

  public async exec (req: Request, res: Response) {
    const isAdmin = req.params.admin === 'admin';
    const isVerify = isAdmin && req.params.verify === 'verify';

    if (req.signedCookies.userId && !(isAdmin || isVerify)) throw new ApiError(401);
    if (isVerify) {
      const mocked = req.body;
      const [ admin ]: IAdminUser[] = await this.server.util.db('admin').select([
        'userId',
        'password',
        '_salt',
        '_iterations',
        'ip',
        'lastLogin',
      ])
        .where({ username: mocked.username });
      const ip = this.server.stores.passwordAttempts.get(req.ip);
      const registered = ip ? true : false;
      const remaining = () => 5 - (registered ? ip.attempts : 1);
      const increment = () => this.server.stores.passwordAttempts.set(req.ip, {
        attempts: registered ? ++ip.attempts : 1
      });
      const redirect = () => {
        increment();

        return res.render('admin/login', { invalid: true, attempts: remaining() });
      };

      if (!admin) return redirect();
      if (registered && ip.attempts === 5) throw new ApiError(403);

      const valid = await this._validPassword(admin.password, admin._salt, admin._iterations, mocked.password);

      if (!valid) return redirect();

      await this.server.util.db('admin').update({
          ip: req.ip,
          slug: req.signedCookies.slug
        })
        .where('username', mocked.username);

      return res
        .cookie('userId', admin.userId, {
          httpOnly: true,
          maxAge: 6048e5,
          secure: this.server.production,
          signed: true
        })
        .cookie('ip', admin.ip)
        .cookie('lastLogin', admin.lastLogin)
        .redirect('/admin');
    }

    const slug = shortid.generate();

    this.server.stores.states.set(slug, { timestamp: Date.now(), url: req.headers.referer });

    if (isAdmin)
      return res
        .cookie('slug', slug, { httpOnly: true, secure: this.server.production, signed: true })
        .render('admin/login');

    res
      .cookie('slug', slug, { maxAge: 18e5, httpOnly: true, secure: this.server.production, signed: true })
      .redirect([
        'https://discordapp.com/oauth2/authorize?',
        'client_id=' + this.server.auth.discord.key,
        '&response_type=code',
        `&redirect_uri=${this.server.auth.rootURL + this.server.auth.discord.callback}`,
        '&scope=identify',
        '&state=' + slug,
      ].join(''));
  }

  /**
   * Validates password with the admin user database.
   * @param hash The hashed password
   * @param salt The hashed password's salt
   * @param iterations The hashed password's iterations
   * @param mocked The attempting password
   */
  protected _validPassword (hash: string, salt: string, iterations: number, mocked: string) {
    return new Promise((resolve, reject) => {
      pbkdf2(mocked, salt, iterations, 256, 'sha256', (err, mockedHash) => {
        if (err) return reject(err);

        resolve(hash === mockedHash.toString('hex'));
      });
    });
  }
}
