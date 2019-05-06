import { IApiOptions } from '../../typings';
import ApiError from '../util/ApiError';
import Route from './Route';

export default class ApiRoute extends Route {
  constructor (options?: IApiOptions) {
    super(options);

    this.cooldown = options.cooldown || 1;

    this.max = options.max || 3;
  }

  public cooldown: number;
  public max: number;

  /**
   * Checks if the data has passed all required fields.
   *
   * Throws an error if it does not meet the requirement above.
   * @param data The data to check
   * @param except Data entries to exempt from requirement
   */
  public async _hasData (data, ...except: string[]) {
    const isExempted = entry => except.includes(entry) ? true : data[entry];
    const hasAll: boolean = isExempted('token') && isExempted('user') &&
      isExempted('id');

    if (!hasAll)
      throw new ApiError(400, 'Incomplete data.');

    const validToken = data.token === this.server.auth.api.token;

    if (!validToken)
      throw new ApiError(401, 'Invalid token.');

    return true;
  }

  /**
   * Filters an object.
   * @param obj Object to filter
   * @param fn Function to use as filter
   */
  public _filter (obj: object, fn: (el: any) => any) {
    return Object.keys(obj)
      .filter(el => fn(obj[el]))
      .reduce((prev, cur) => Object.assign(prev, { [cur]: obj[cur] }), {});
  }
}
