const limits = require('../../auth.json').rateLimits;
const { hostAddress } = require('../../auth.json');

module.exports.execute = (req, res, next) => {
  const methods = Object.keys(limits);

  this.reInitialise = (method, methodFilter) => this.initialise(method, methodFilter);
  this.initialise = (method, methodFilter) => {
    methodFilter.set(req.ip, { address: req.ip, triggers: 1, timestamp: Date.now() });

    const user = methodFilter.get(req.ip);
    console.log(`${new Date().toLocaleString()}: [I/RI] API: User: ${user.address} | Method: ${method.toUpperCase()} | Triggers: ${user.triggers}`);
  };
  this.update = (method, methodFilter) => {
    let user = methodFilter.get(req.ip);
    methodFilter.set(req.ip, { address: req.ip, triggers: user.triggers + 1, timestamp: user.timestamp });

    user = methodFilter.get(req.ip);
    console.log(`${new Date().toLocaleString()}: [U] API: User: ${user.address} | Method: ${method.toUpperCase()} | Triggers: ${user.triggers}`);
  }

  try {
    if(!methods.includes(req.params.method)) throw { status: 404, message: 'Not a valid method.' };
    if(req.ip.includes(hostAddress)) return next();
    const method = req.params.method;
    const methodFilter = rateLimits.get(method);
    const userFilter = methodFilter.filter(r => r.address === req.ip);
    const user = userFilter.first() || null;

    if(!user) {
      this.initialise(method, methodFilter);
      return next();
    }
    else {
      const max = limits[method].max;
      const cooldown = limits[method].cooldown * 1000;
      const isExpired = Date.now() - user.timestamp >= cooldown;

      if(isExpired) {
        this.reInitialise(method, methodFilter);
        return next();
      }
      else if(user.triggers === limits[method].max && !isExpired)
        throw {
          status: 429,
          message: [
            'Maximum requests for this method has been reached (3/5s).',
            `Please wait for ${((user.timestamp + cooldown) - Date.now()) / 1000} seconds.`
          ].join(' ')
        };
      this.update(method, methodFilter);
      next();
    }
  }
  catch (err) {
    if(!isNaN(err.status))
      res
        .status(err.status)
        .json({ error: err.message });
    else
      res
        .status(500)
        .json({ error: err.message });
  }
}