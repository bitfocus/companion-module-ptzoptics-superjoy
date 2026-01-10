import { FIELDS } from './fields.js'
import { SuperJoyCommandError } from './error.js'

const ACTION_NAMES = {
	hdmiout: 'HDMI Output Control',
	custom: 'Trigger Custom Button',
	camselect: 'Select Group and Camera',
	directpresets: 'Select Group, Camera, and Preset',
	presets: 'Select Preset on Current Camera',
}

/**
 * Class representing PTZ SuperJoy actions.
 * @class
 *
 * This is implemented as a class so that the SuperJoy instance can be stored
 * as a member variable for use in callbacks and error messages.
 */
export class PTZSuperJoyActions {
	/**
	 * @property {PTZSuperJoyInstance} superJoyInstance - The instance of the SuperJoy controller.
	 */
	superJoyInstance = null

	/**
	 * Constructor for PTZSuperJoyActions.
	 * @param {PTZSuperJoyInstance} superJoyInstance - The instance of the SuperJoy controller.
	 */
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
				superJoyInstance: this.superJoyInstance,
			})
		}
		this.superJoyInstance.sendInquiry()
	}

	/**
	 * Initialize action definitions for the SuperJoy controller.
	 */
	initActions() {
		let actions = {
			hdmiout: {
				name: ACTION_NAMES['hdmiout'],
				options: [FIELDS.HDMIControl],
				callback: async (action) => {
					let argMap = new Map([['action', action.options.hdmicontrol]])
					this.superJoyInstance.sendCommand('hdmiout', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
			custom: {
				name: ACTION_NAMES['custom'],
				options: [FIELDS.CustomButton],
				callback: async (action, context) => {
					let fields = this.superJoyInstance.getFields()
					let buttonTxt = await context.parseVariablesInString(action.options.buttonid)
					let buttonId = fields.validateCustomButton(ACTION_NAMES['custom'], buttonTxt)
					let argMap = new Map([
						['action', 'trigger'],
						['buttonid', buttonId],
					])
					this.superJoyInstance.sendCommand('custom', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
			camselect: {
				name: ACTION_NAMES['camselect'],
				options: [FIELDS.Group, FIELDS.Camera],
				callback: async (action, context) => {
					let fields = this.superJoyInstance.getFields()
					let groupTxt = await context.parseVariablesInString(action.options.group)
					let camidTxt = await context.parseVariablesInString(action.options.id)
					let groupAndCam = fields.validateGroupAndCamera(ACTION_NAMES['camselect'], groupTxt, camidTxt)
					let argMap = new Map([
						['group', groupAndCam.group],
						['camid', groupAndCam.camid],
					])
					this.superJoyInstance.sendCommand('camselect', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
			directpresets: {
				name: ACTION_NAMES['directpresets'],
				options: [FIELDS.Group, FIELDS.Camera, FIELDS.Preset, FIELDS.Speed],
				callback: async (action, context) => {
					let fields = this.superJoyInstance.getFields()
					let groupTxt = await context.parseVariablesInString(action.options.group)
					let camidTxt = await context.parseVariablesInString(action.options.id)
					let groupAndCam = fields.validateGroupAndCamera(ACTION_NAMES['directpresets'], groupTxt, camidTxt)
					let presetTxt = await context.parseVariablesInString(action.options.preset)
					let presetSpeedTxt = await context.parseVariablesInString(action.options.speed)
					let preset = fields.validatePreset(ACTION_NAMES['directpresets'], presetTxt)
					let presetSpeed = fields.validatePresetSpeed(ACTION_NAMES['directpresets'], presetSpeedTxt)
					let argMap = new Map([
						['action', 'recall'],
						['group', groupAndCam.group],
						['camid', groupAndCam.camid],
						['preset', preset],
						['presetspeed', presetSpeed],
					])
					this.superJoyInstance.sendCommand('directpresets', argMap, {
						function: this.actionCallback,
						data: null,
					})
				},
			},
			presets: {
				name: ACTION_NAMES['presets'],
				options: [FIELDS.Preset, FIELDS.Speed],
				callback: async (action, context) => {
					let fields = this.superJoyInstance.getFields()
					let presetTxt = await context.parseVariablesInString(action.options.preset)
					let presetSpeedTxt = await context.parseVariablesInString(action.options.speed)
					let preset = fields.validatePreset(ACTION_NAMES['presets'], presetTxt)
					let presetSpeed = fields.validatePresetSpeed(ACTION_NAMES['presets'], presetSpeedTxt)
					let argMap = new Map([
						['action', 'recall'],
						['preset', preset],
						['presetspeed', presetSpeed],
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
