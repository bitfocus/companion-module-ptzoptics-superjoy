import { FIELDS } from './fields.js'
import { combineRgb } from '@companion-module/base'

const FEEDBACK_NAMES = {
	groupIsSelected: 'Is Camera Group Selected',
	cameraIsSelected: 'Is Group and Camera Selected',
	presetIsSelected: 'Is Group, Camera, and Preset Selected',
	HDMIState: 'HDMI Output State',
}

export class PTZSuperJoyFeedbacks {
	/**
	 * Reference to the SuperJoy Instance for the module.
	 * It stored in the class so it can update the module.
	 * @param {PTZSuperJoyInstance} superJoyInstance
	 */
	superJoyInstance = null

	/**
	 * Constuctor that takes a reference to the SuperJoy Instance
	 * @param {PTZSuperJoyInstance} superJoyInstance
	 */
	constructor(superJoyInstance) {
		// superJoyIntance is the main class inherited from CompanionBase
		this.superJoyInstance = superJoyInstance
		this.initFeedbacks()
	}

	/**
	 * Initialize the Feedbacks
	 * @returns Feedbacks defined for the SuperJoyModule
	 */
	initFeedbacks() {
		const ColorBlack = combineRgb(0, 0, 0) // Black
		const ColorGreen = combineRgb(0, 255, 0) // Green

		let feedbacks = {
			groupIsSelected: {
				type: 'boolean',
				name: FEEDBACK_NAMES['groupIsSelected'],
				defaultStyle: {
					color: ColorBlack,
					bgcolor: ColorGreen,
				},
				options: [FIELDS.Group],
				callback: async (feedback, context) => {
					let fields = this.superJoyInstance.getFields()
					let variables = this.superJoyInstance.getVariables()
					let groupTxt = await context.parseVariablesInString(feedback.options.group)
					let group = fields.validateGroup(FEEDBACK_NAMES['groupIsSelected'], groupTxt)
					return variables.getVariable('group') === group
				},
			},
			cameraIsSelected: {
				type: 'boolean',
				name: FEEDBACK_NAMES['cameraIsSelected'],
				defaultStyle: {
					color: ColorBlack,
					bgcolor: ColorGreen,
				},
				options: [FIELDS.Group, FIELDS.Camera],
				callback: async (feedback, context) => {
					let fields = this.superJoyInstance.getFields()
					let variables = this.superJoyInstance.getVariables()
					let groupTxt = await context.parseVariablesInString(feedback.options.group)
					let camidTxt = await context.parseVariablesInString(feedback.options.id)
					let groupAndCam = fields.validateGroupAndCamera(FEEDBACK_NAMES['cameraIsSelected'], groupTxt, camidTxt)
					return (
						variables.getVariable('group') === groupAndCam.group && variables.getVariable('camid') === groupAndCam.camid
					)
				},
			},
			presetIsSelected: {
				type: 'boolean',
				name: FEEDBACK_NAMES['presetIsSelected'],
				defaultStyle: {
					color: ColorBlack,
					bgcolor: ColorGreen,
				},
				options: [FIELDS.Group, FIELDS.Camera, FIELDS.Preset],
				callback: async (feedback, context) => {
					let fields = this.superJoyInstance.getFields()
					let variables = this.superJoyInstance.getVariables()
					let groupTxt = await context.parseVariablesInString(feedback.options.group)
					let camidTxt = await context.parseVariablesInString(feedback.options.id)
					let groupAndCam = fields.validateGroupAndCamera(FEEDBACK_NAMES['presetIsSelected'], groupTxt, camidTxt)
					let presetTxt = await context.parseVariablesInString(feedback.options.preset)
					let preset = fields.validatePreset(FEEDBACK_NAMES['presetIsSelected'], presetTxt)
					return (
						variables.getVariable('group') === groupAndCam.group &&
						variables.getVariable('camid') === groupAndCam.camid &&
						variables.getVariable('preset') === preset
					)
				},
			},
			HDMIState: {
				type: 'boolean',
				name: FEEDBACK_NAMES['HDMIState'],
				defaultStyle: {
					color: ColorBlack,
					bgcolor: ColorGreen,
				},
				options: [FIELDS.HDMIState],
				callback: (feedback) => {
					let variables = this.superJoyInstance.getVariables()
					return variables.getVariable('hdmi') === feedback.options.hdmistate
				},
			},
		}
		this.superJoyInstance.setFeedbackDefinitions(feedbacks)
	}
}
