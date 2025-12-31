export class SuperJoyCommandError extends Error {
  constructor(message, options = {}) {
    super(message + ` url: ${options?.url}`)
    this.name = "SuperJoyCommandError"
    this.caller = options.caller
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SuperJoyCommandError)
    }
  }
}

export function handleError (err) {
    if (err instanceof SuperJoyCommandError) {
        err.caller.log('error', `${err.name}: ${err.message}`)
        err.caller.updateStatus('connection_failure')
    } else {
        console.log('error', `UnexpectedError: ${err.message}`)
        //console.updateStatus('unknown_error')
    }
}
