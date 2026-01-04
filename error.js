/**
 * SuperJoyCommandError is thrown when an error occurs during sending a command
 * from Companion to the controller, or during the processing of the response.
 * @class
 * @extends Error
 */
export class SuperJoyCommandError extends Error {
	constructor(message, options = {}) {
		super(message + ` url: ${options?.url}`)
		this.name = 'SuperJoyCommandError'
		this.caller = options.caller
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, SuperJoyCommandError)
		}
	}
}

/**
 * Handle a thrown SuperJoyCommandError. This updates the status to connection_failure.
 */
export function handleError(err) {
	if (err instanceof SuperJoyCommandError) {
		err.caller.log('error', `${err.name}: ${err.message}`)
		err.caller.updateInstanceStatus('connection_failure')
	} else {
		// Someone called our error handler for some other exception
		console.log('error', `UnexpectedError: ${err.message}`)
		throw err
	}
}
