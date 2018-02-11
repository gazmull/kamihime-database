const methods = require('../../auth.json').rateLimits;
const { hostAddress } = require('../../auth.json');

module.exports.execute = (req, res, next) => {
  this.validateRequest = request => {
    for(const method of rateLimits.keys()) {
      for(const key of rateLimits.get(method).keys()) {
        if(key === request) {
          return true;
          break;
        }
      }
    }
    return false;
  };
  this.getMethod = request => {
    for(const method of rateLimits.keys()) {
      for(const key of rateLimits.get(method).keys()) {
        if(key === request) {
          return method;
          break;
        }
      }
    }
  };
  this.reInitialise = (request, requestFilter) => this.initialise(request, requestFilter);
  this.initialise = (request, requestFilter) => {
    requestFilter.set(req.ip, { address: req.ip, triggers: 1, timestamp: Date.now() });

    const user = requestFilter.get(req.ip);
    console.log(
      `${new Date().toLocaleString()}: [I/RI] API: User: ${user.address} | request: ${this.getMethod(request)}/${request} | Triggers: ${user.triggers}`
    );
  };
  this.update = (request, requestFilter) => {
    let user = requestFilter.get(req.ip);
    requestFilter.set(req.ip, { address: req.ip, triggers: user.triggers + 1, timestamp: user.timestamp });

    user = requestFilter.get(req.ip);
    console.log(
      `${new Date().toLocaleString()}: [U] API: User: ${user.address} | request: ${this.getMethod(request)}/${request} | Triggers: ${user.triggers}`
    );
  }

  try {
    if(!this.validateRequest(req.params.request)) throw { code: 404, message: 'Request method not found.' };
    const request = req.params.request;
    const file = require(`./${this.getMethod(request)}/${request}`);

    if(req.ip.includes(hostAddress)) return file.execute(req, res, next);

    const requestFilter = rateLimits.get(this.getMethod(request)).get(request);
    const userFilter = requestFilter.filter(r => r.address === req.ip);
    const user = userFilter.first() || null;

    if(!user) {
      this.initialise(request, requestFilter);
      return file.execute(req, res, next);
    }
    else {
      const requests = methods[this.getMethod(request)];
      const max = requests[request].max;
      const cooldown = requests[request].cooldown * 1000;
      const isExpired = Date.now() - user.timestamp >= cooldown;

      if(isExpired) {
        this.reInitialise(request, requestFilter);
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
      this.update(request, requestFilter);
      file.execute(req, res, next);
    }
  }
  catch (err) { errorHandler(res, err); }
}