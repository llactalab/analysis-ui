import createLogError from 'lib/utils/log-error'

// Just log it once
const logError = createLogError(1)

if (
  process.browser &&
  process.env.LOGROCKET &&
  process.env.LOGROCKET !== 'false'
) {
  const LogRocket = require('logrocket')
  LogRocket.init(process.env.LOGROCKET)
  module.exports = LogRocket
} else {
  module.exports = {
    identify(...args) {
      logError('LogRocket not enabled', ...args)
    },
    captureException(...args) {
      logError(...args)
    }
  }
}
