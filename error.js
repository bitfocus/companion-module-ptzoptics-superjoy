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
		this.superJoyInstance = options.superJoyInstance
	}
}

/**
 * Handle a thrown SuperJoyCommandError. This updates the status to connection_failure
 * and restarts polling to try and connect again.
 * @param {SuperJoyCommandError} err
 */
export function handleSuperJoyCommandError(err) {
	if (err instanceof SuperJoyCommandError) {
		err.superJoyInstance.log('error', `${err.name}: ${err.message}`)
		err.superJoyInstance.updateInstanceStatus('connection_failure')
	} else {
		// Someone called our error handler for some other exception
		console.log('error', `UnexpectedError: ${err.message}`)
		throw err
	}
}
