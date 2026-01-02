import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { configFields } from './config.js'
import { upgradeScripts } from './upgrades.js'
import { PTZSuperJoyVariables } from './variables.js'
import { PTZSuperJoyActions } from './actions.js'
import { SuperJoyCommandError, handleError } from './error.js'
import { initPresets } from './presets.js'
import { initFeedbacks } from './feedbacks.js'

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
	 * @property {PTZSuperJoyVariables} variables - Instance of the variables class for the module.
	 */
	variables = null
	/**
	 * @property {PTZSuperJoyActions} actions - Instance of the actions class for the module.
	 */
	actions = null
	/**
	 * @property {Object} feedbacks - The declared feedbacks for the module.
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
	 * @param {string} msg Message indicating the source of the configuration change
	 */
	initOrUpdateConfig(config, msg) {
		this.log('debug', `initOrUpdateConfig - config: ${JSON.stringify(config)}`)
		this.config = config
		this.pollStatusTimer = null
		this.instanceStatus = null

		this.updateInstanceStatus(InstanceStatus.Connecting, msg)
		this.variables = new PTZSuperJoyVariables(this)
		this.actions = new PTZSuperJoyActions(this)
		this.feedbacks = initFeedbacks.bind(this)()
		this.presets = initPresets.bind(this)()
		if (this.config.controller !== undefined) {
			this.updateState()
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
	 * Callback function for handling inquiry responses. This sets all Variables and checks Feedbacks.
	 * It also starts the polling timer if it is not already running so that changes made directly on
	 * the controller are reflected in Companion.
	 * @param {Object} json JSon response from the controller
	 * @param {Object} _data Callback data given by the caller with the request url added, used.
	 */
	sendInquiryCallback = (json, _data) => {
		// this.log('debug', `url: ${url} json is ${json} data is ${data}`)
		this.variables.updateVariables(json)
		this.checkFeedbacks()
		if (this.pollingStatusTimer == null) {
			this.pollingStatusTimer = setInterval(this.sendInquiry, 1000)
		}
	}

	/**
	 * Send an inquiry command to the controller to get its current status.
	 * This is called periodically to keep the state in sync as well as explicitly
	 * by updateState() whenever an action is sent.
	 */
	sendInquiry = () => {
		let argMap = new Map([['action', 'status']])
		this.sendCommand('inquiry', argMap, {
			function: this.sendInquiryCallback,
			data: null,
		})
	}

	/**
	 * Immediately query the controller state. This is called whenever the module sends
	 * an Action that modifies the state of the controller so the state change is reflected
	 * as soon as possible.
	 */
	updateState() {
		// Stop any ongoing polling, we are going to restart it in the callback.
		if (this.pollingStatusTimer != null) {
			clearInterval(this.pollingStatusTimer)
			this.pollingStatusTimer = null
		}
		this.sendInquiry()
	}

	/**
	 * The configuration fields for the web config.
	 * @override
	 * @returns (Object[]) Configuration fields for web config
	 */
	getConfigFields() {
		return configFields
	}

	async sendCommand(command, argMap, callback) {
		let url = `http://${this.config.controller}/cgi-bin/joyctrl.cgi?f=${command}`
		argMap.forEach((value, key) => {
			url = url + `&${key}=${value}`
		})
		fetch(url)
			.then((response) => {
				if (response.status != 200) {
					throw new SuperJoyCommandError(`Error response - expected 200, got ${response.status}`, {
						url: url,
						caller: this,
					})
				}
				this.updateInstanceStatus('ok')
				return response.json()
			})
			.then((json) => {
				if (callback?.data == null) {
					callback.data = { url: url }
				} else {
					callback.data.url = url
				}
				callback.function(json, callback.data)
			})
			.catch((e) => {
				handleError(e)
			})
	}
}

runEntrypoint(PTZSuperJoyInstance, upgradeScripts)
