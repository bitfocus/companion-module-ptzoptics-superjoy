import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { configFields } from './config.js'
import { upgradeScripts } from './upgrades.js'
import { PTZSuperJoyFields } from './fields.js'
import { PTZSuperJoyVariables } from './variables.js'
import { PTZSuperJoyActions } from './actions.js'
import { initPresets } from './presets.js'
import { PTZSuperJoyFeedbacks } from './feedbacks.js'
import { SuperJoyCommandError, handleSuperJoyCommandError } from './error.js'
import { Queue } from './queue.js'

/**
 * SuperJoySequenceError is thrown when an error occurs due to an incorrect initialization sequence
 */
class SuperJoySequenceError extends Error {
	constructor(message) {
		super(message)
		this.name = 'SuperJoySequenceError'
	}
}

/**
 * Main class for the PTZOptics SuperJoy Companion Module
 * @class
 * @extends InstanceBase
 */
class PTZSuperJoyInstance extends InstanceBase {
	/**
	 * @property {Object} config - The Companion configuration object for the module.
	 */
	config = {}
	/**
	 * @property {PTZSuperJoyFields} fields - Instance of the fields class for the module.
	 */
	fields = null
	/**
	 * @property {PTZSuperJoyVariables} variables - Instance of the variables class for the module.
	 */
	variables = null
	/**
	 * @property {PTZSuperJoyActions} actions - Instance of the actions class for the module.
	 */
	actions = null
	/**
	 * @property {PTZSuperJoyFeedbacks} feedbacks - The declared feedbacks for the module.
	 */
	feedbacks = null
	/**
	 * @property {Object} presets - The declared presets for the module.
	 */
	presets = null
	/**
	 * @property {NodeJS.Timeout} pollingStatusTimer - Timer for polling the controller status.
	 */
	pollingStatusTimer = null
	/**
	 * @property {string} instanceStatus - Current connection status of the module.
	 */
	instanceStatus = null

	/**
	 * @property {Queue} queue - Queue to manage asynchronous tasks sequentially.
	 */
	queue = null

	/**
	 * @property {number} sequence - Sequence number for commands sent to the controller.
	 */
	sequence = 0

	constructor(internal) {
		super(internal)
		this.queue = new Queue(250) // 250 ms delay between tasks
		this.sequence = 0
	}

	/**
	 * Initialize and configure the module instance when first created.
	 * @override
	 * @param {*} config Configuration passed from Companion
	 */
	init(config) {
		this.initOrUpdateConfig(config, 'init')
	}

	/**
	 * Update the module configuration after a change in settings.
	 * @override
	 * @param {Object} config Configuration passed from Companion
	 */
	configUpdated(config) {
		this.initOrUpdateConfig(config, 'configUpdated')
	}

	/**
	 * Configure the module instance with the given configuration. This is called by
	 * both init() and configUpdated() as there is no difference in the behavior.
	 * @param {Object} config Configuration passed from Companion
	 * @param {string} msg Message indicating the source of the configuration change ('init' or 'configUpdated')
	 */
	initOrUpdateConfig(config, msg) {
		this.log('debug', `initOrUpdateConfig - config: ${JSON.stringify(config)}`)
		this.config = config
		this.pollStatusTimer = null
		this.instanceStatus = null

		this.updateInstanceStatus(InstanceStatus.Connecting, msg)
		this.fields = new PTZSuperJoyFields(this)
		this.variables = new PTZSuperJoyVariables(this)
		this.actions = new PTZSuperJoyActions(this)
		this.feedbacks = new PTZSuperJoyFeedbacks(this)
		this.presets = initPresets.bind(this)()
		if (this.config.controller !== undefined) {
			this.sendInquiry()
		} else {
			this.log('error', 'Please configure the controller ip address or host')
		}
	}

	/**
	 * Destroy the module instance when deleted.
	 * @override
	 */
	async destroy() {
		// Stop the polling timer
		if (this.pollingTimer !== undefined) {
			clearInterval(this.pollingTimer)
		}
	}

	/**
	 * The configuration fields for the web config.
	 * @override
	 * @returns (Object[]) Configuration fields for web config
	 */
	getConfigFields() {
		return configFields
	}

	/**
	 * Return the PTZSuperJoyFields instance for this module.
	 * @returns {PTZSuperJoyFields} The fields instance
	 */
	getFields() {
		if (this.fields == null) {
			throw new SuperJoySequenceError('Fields not initialized')
		}
		return this.fields
	}

	/**
	 * Return the PTZSuperJoyVariables instance for this module.
	 * @returns {PTZSuperJoyVariables} The variables instance
	 */
	getVariables() {
		if (this.variables == null) {
			throw new SuperJoySequenceError('Variables not initialized')
		}
		return this.variables
	}

	/**
	 * Updates the Companion connection status. This wraps updateStatus() so that we only
	 * call updateStatus() when the status changes. This keeps the debug logs from filling
	 * up with 'OK' status settings during polling. Actions and other events that change
	 * the status will still be reflected immediately.
	 * @param {InstanceStatus} newStatus
	 */
	updateInstanceStatus(newStatus) {
		if (this.instanceStatus != newStatus) {
			this.instanceStatus = newStatus
			this.updateStatus(newStatus)
		}
	}

	/**
	 * Send a command to the SuperJoy controller, handle the response, and manage polling.
	 * @async
	 * @throws {SuperJoyCommandError} when an error occurs during the command or response processing.
	 * @returns {Promise<void>} Resolves when the command is complete.
	 * @param {string} command The command portion of the URL
	 * @param {*} argMap Map of arguments to the command
	 * @param {*} callback Callback to be called on a successful request
	 *
	 * The controller gets very upset if more than one command is sent at a time before a
	 * response. This can hang the controller requiring a power cycle. The syncronization
	 * algorithm to prevent this works as follows:
	 *
	 * 1) Stop polling before sending any command. This ensures that no polling inquiries will
	 * 	occur while the command is being processed.
	 * 2) Restart polling in a `finally` clause after the command is complete, whether it
	 *	succeeded or failed. This will cause a {@link sendInquiry} to be sent one second later.
	 *
	 * This algorithm means status is updated approximately every second. To make Actions that change
	 * state slightly more responsive, the {@link actionCallback} functions calls {@link sendInquiry} immediately
	 * after a successful command. Which in turn causes an immediate status update followed by resumption of
	 * the one second polling interval.
	 */
	async sendCommand(command, argMap, callback) {
		return this.queue.push(async () => {
			this.stopPolling()
			this.sequence = (this.sequence + 1) % 10000
			let url = `http://${this.config.controller}/cgi-bin/joyctrl.cgi?f=${command}`
			argMap.forEach((value, key) => {
				url = url + `&${key}=${value}`
			})
			this.log('debug', `Sending command to SuperJoy: sequence ${this.sequence} url: ${url}`)
			try {
				const response = await fetch(url)
				if (response.status != 200) {
					throw new SuperJoyCommandError(
						`Error response: sequence ${this.sequence} expected 200, got ${response.status}`,
						{
							url: url,
							superJoyInstance: this,
						},
					)
				}
				this.log(
					'debug',
					`Received response: sequence ${this.sequence} url: ${url} status: ${response.status} statusText : ${response.statusText}`,
				)
				this.updateInstanceStatus('ok')

				const json = await response.json()
				this.log('debug', `Received json: sequence ${this.sequence} url: ${url} json: ${JSON.stringify(json)}`)

				// Add the URL that was sent to the callback data for error reporting
				if (callback?.data == null) {
					callback.data = { url: url }
				} else {
					callback.data.url = url
				}
				callback.function(json, callback.data)
			} catch (error) {
				this.log('debug', `Catch: sequence ${this.sequence}`)
				handleSuperJoyCommandError(error)
			} finally {
				this.log('debug', `Finally: sequence ${this.sequence}`)
				this.startPolling()
			}
		})
	}

	/**
	 * Callback function for handling inquiry responses. This sets all Variables and checks Feedbacks.
	 * @param {Object} json JSon response from the controller
	 * @param {Object} _data Callback data given by the caller with the request url added, used.
	 */
	sendInquiryCallback = (json, _data) => {
		// this.log('debug', `url: ${url} json is ${json} data is ${data}`)
		this.variables.updateVariables(json)
		this.checkFeedbacks()
	}

	/**
	 * Send an inquiry command to the controller to get its current status.
	 * This is called periodically to keep the state in sync
	 */
	sendInquiry = () => {
		if (this.queue.length() == 0) {
			let argMap = new Map([['action', 'status']])
			this.sendCommand('inquiry', argMap, {
				function: this.sendInquiryCallback,
				data: null,
			})
		}
	}

	/**
	 * Start the polling timer to call {@link sendInquiry} in one second.
	 */
	startPolling() {
		if (this.pollingStatusTimer == null) {
			this.pollingStatusTimer = setInterval(this.sendInquiry, 5000)
		}
	}

	/**
	 * Stop the polling timer.
	 */
	stopPolling() {
		if (this.pollingStatusTimer != null) {
			clearInterval(this.pollingStatusTimer)
			this.pollingStatusTimer = null
		}
	}
}

runEntrypoint(PTZSuperJoyInstance, upgradeScripts)
