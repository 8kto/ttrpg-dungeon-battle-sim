const path = require('path')

module.exports = (request, options) => {
  // Strip out the URL parameters (e.g., ?v=$VERSION$)
  const cleanRequest = request.replace(/\?v=\$VERSION\$/, '')

  // Resolve the module using Node's resolution algorithm
  return options.defaultResolver(cleanRequest, {
    ...options,
    basedir: path.resolve(options.basedir),
  })
}
