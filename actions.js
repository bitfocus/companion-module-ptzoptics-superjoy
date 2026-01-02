import { FIELDS } from './fields.js'
import { SuperJoyCommandError } from './error.js'

/**
 * Class representing PTZ SuperJoy actions.
 * @class
 * @param {Object} superJoyInstance - The instance of the SuperJoy controller.
 *
 * This is implemented as a class so that the SuperJoy instance can be stored
 * as a member variable for use in callbacks.
 */
export class PTZSuperJoyActions {
	/**
	 * @property {PTZSuperJoyInstance} superJoyInstance - The instance of the SuperJoy controller.
	 */
	superJoyInstance = null

	constructor(superJoyInstance) {
		this.superJoyInstance = superJoyInstance
		this.initActions()
	}

	/**
	 * Callback function for handling action responses.
	 * @param {*} json - The json representation of the http response
	 * @param {*} data - callback data given by the caller with the current url added
	 */
	actionCallback = (json, data) => {
		if (json.result !== '0') {
			throw new SuperJoyCommandError(`Result is ${json.result}, expect zero`, {
				url: data.url,
				caller: this,
			})
		}
		this.superJoyInstance.updateState()
	}

	/**
	 * Initialize action definitions for the SuperJoy controller.
	 */
	initActions() {
		let actions = {
			hdmioutput: {
				name: 'HDMI Output Control',
				options: [FIELDS.HDMIControl],
				callback: async (action) => {
					let argMap = new Map([['action', action.options.hdmicontrol]])
					this.superJoyInstance.sendCommand('hdmiout', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
			custombutton: {
				name: 'Trigger Custom Button',
				options: [FIELDS.CustomButton],
				callback: async (action) => {
					let argMap = new Map([
						['action', 'trigger'],
						['buttonid', action.options.buttonid],
					])
					this.superJoyInstance.sendCommand('custom', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
			selectcam: {
				name: 'Select Group and Camera',
				options: [FIELDS.Group, FIELDS.Camera],
				callback: async (action) => {
					let argMap = new Map([
						['group', action.options.group],
						['camid', action.options.id],
					])
					this.superJoyInstance.sendCommand('camselect', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
			directpreset: {
				name: 'Select Group, Camera, and Preset',
				options: [FIELDS.Group, FIELDS.Camera, FIELDS.Preset, FIELDS.Speed],
				callback: async (action) => {
					let argMap = new Map([
						['action', 'recall'],
						['group', action.options.group],
						['camid', action.options.id],
						['preset', action.options.preset],
						['presetspeed', action.options.speed],
					])
					this.superJoyInstance.sendCommand('directpresets', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
			currentpreset: {
				name: 'Select Preset on Current Camera',
				options: [FIELDS.Preset, FIELDS.Speed],
				callback: async (action) => {
					let argMap = new Map([
						['action', 'recall'],
						['preset', action.options.preset],
						['presetspeed', action.options.speed],
					])
					this.superJoyInstance.sendCommand('presets', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
		}
		this.superJoyInstance.setActionDefinitions(actions)
	}
}
