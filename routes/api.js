const methods = require('../auth.json').rateLimits;
const { hostAddress } = require('../auth.json');

class API {
  constructor() {
    this.id= 'api';
    this.method = 'get';
    this.route = ['/api/:request', '/api/:request/*?'];
  }

  execute(req, res, next) {
    try {
      if(!this.validateRequest(req)) throw { code: 404, message: 'Request method not found.' };
      const request = req.params.request;
      const file = new (require(`../api/${this.getMethod(req)}/${request}`))();

      if(req.ip.includes(hostAddress)) return file.execute(req, res, next);

      const requestFilter = rateLimits.get(this.getMethod(req)).get(request);
      const userFilter = requestFilter.filter(r => r.address === req.ip);
      const user = userFilter.first() || null;

      if(!user) {
        this.initialise(req, requestFilter);
        return file.execute(req, res, next);
      }
      else {
        const requests = methods[this.getMethod(req)];
        const max = requests[request].max;
        const cooldown = requests[request].cooldown * 1000;
        const isExpired = Date.now() - user.timestamp >= cooldown;

        if(isExpired) {
          this.reInitialise(req, requestFilter);
          return file.execute(req, res, next);
        }
        else if(user.triggers === requests[request].max && !isExpired)
          throw {
            code: 429,
            message: [
              `Maximum requests for this request has been reached (${max}/${cooldown / 1000}s).`,
              `Please wait for ${((user.timestamp + cooldown) - Date.now()) / 1000} seconds.`
            ].join(' '),
            remaining: ((user.timestamp + cooldown) - Date.now())
          };
        this.update(req, requestFilter);
        file.execute(req, res, next);
      }
    }
    catch (err) { errorHandler(res, err); }
  }

  validateRequest(req){
    const request = req.params.request;
    for(const method of rateLimits.keys()) {
      for(const key of rateLimits.get(method).keys()) {
        if(key === request) {
          return true;
          break;
        }
      }
    }
    return false;
  }

  getMethod(req) {
    const request = req.params.request;
    for(const method of rateLimits.keys()) {
      for(const key of rateLimits.get(method).keys()) {
        if(key === request) {
          return method;
          break;
        }
      }
    }
  }

  reInitialise(req, requestFilter) { this.initialise(req, requestFilter); }
  initialise(req, requestFilter) {
    const request = req.params.request;
    requestFilter.set(req.ip, { address: req.ip, triggers: 1, timestamp: Date.now() });

    const user = requestFilter.get(req.ip);
    console.log(
      `${new Date().toLocaleString()}: [I/RI] API: User: ${user.address} | request: ${this.getMethod(req)}/${request} | Triggers: ${user.triggers}`
    );
  }

  update(req, requestFilter) {
    let user = requestFilter.get(req.ip);
    const request = req.params.request;
    requestFilter.set(req.ip, { address: req.ip, triggers: user.triggers + 1, timestamp: user.timestamp });

    user = requestFilter.get(req.ip);
    console.log(
      `${new Date().toLocaleString()}: [U] API: User: ${user.address} | request: ${this.getMethod(req)}/${request} | Triggers: ${user.triggers}`
    );
  }
}

module.exports = API;