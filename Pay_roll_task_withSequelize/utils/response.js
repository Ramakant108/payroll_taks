const httpStatus = require('http-status');

function send(res, defaultStatusCode, options = {}) {
  const { httpStatusCode, ...rest } = options;
  const opts = { statusCode: defaultStatusCode, ...rest };
  const httpCode = httpStatusCode || defaultStatusCode;
  return res.status(httpCode).send(opts);
}

module.exports = {
  /**
   * successful response
   * @param {Object<response>} res response object of express.js
   * @param {Object} options options.
   * @param {String} options.message message to be pass.
   * @param {Any} options.data data be send.
   * @param {Number} [options.httpStatusCode] override HTTP status code (keeps body same)
   */
  ok: (res, options = { message: 'data found' }) =>
    send(res, httpStatus.status.OK, options),

  /**
   * successful creation
   * @param {Object<response>} res response object of express.js
   * @param {Object} options options.
   * @param {String} options.message message to be pass.
   * @param {Any} options.data data be send.
   * @param {Number} [options.httpStatusCode] override HTTP status code (keeps body same)
   */
  created: (res, options = { message: 'data inserted' }) =>
    send(res, httpStatus.status.CREATED, options),
};

