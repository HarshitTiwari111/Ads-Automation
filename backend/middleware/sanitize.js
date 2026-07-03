const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val.replace(/\$/g, '').replace(/\{/g, '').replace(/\}/g, '');
  }
  if (typeof val === 'object' && val !== null) {
    for (const key of Object.keys(val)) {
      if (key.startsWith('$')) {
        delete val[key];
      } else {
        val[key] = sanitizeValue(val[key]);
      }
    }
  }
  return val;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitize;
