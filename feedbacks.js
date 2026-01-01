// import { combineRgb } from '@companion-module/base'
import { FIELDS } from './fields.js'
import { combineRgb } from '@companion-module/base'

export function initFeedbacks() {
	const ColorBlack = combineRgb(0, 0, 0) // Black
	const ColorGreen = combineRgb(0, 255, 0) // Green

	let feedbacks = {
		groupIsSelected: {
			type: 'boolean',
			name: 'Is Camera Group Selected',
			defaultStyle: {
				color: ColorBlack,
				bgcolor: ColorGreen,
			},
			options: [FIELDS.Group],
			callback: (feedback) => {
				return this.variables.getVariable('group') === feedback.options.group
			},
		},
		cameraIsSelected: {
			type: 'boolean',
			name: 'Is Group and Camera Selected',
			defaultStyle: {
				color: ColorBlack,
				bgcolor: ColorGreen,
			},
			options: [FIELDS.Group, FIELDS.Camera],
			callback: (feedback) => {
				return (
					this.variables.getVariable('group') === feedback.options.group &&
					this.variables.getVariable('camid') === feedback.options.id
				)
			},
		},
		presetIsSelected: {
			type: 'boolean',
			name: 'Is Group, Camera, and Preset Selected',
			defaultStyle: {
				color: ColorBlack,
				bgcolor: ColorGreen,
			},
			options: [FIELDS.Group, FIELDS.Camera, FIELDS.Preset],
			callback: (feedback) => {
				return (
					this.variables.getVariable('group') === feedback.options.group &&
					this.variables.getVariable('camid') === feedback.options.id &&
					this.variables.getVariable('preset') === feedback.options.preset
				)
			},
		},
		HDMIState: {
			type: 'boolean',
			name: 'HDMI Output State',
			defaultStyle: {
				color: ColorBlack,
				bgcolor: ColorGreen,
			},
			options: [FIELDS.HDMIState],
			callback: (feedback) => {
				return this.variables.getVariable('hdmi') === feedback.options.hdmistate
			},
		},
	}
	this.setFeedbackDefinitions(feedbacks)
	return feedbacks
}
