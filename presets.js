import { combineRgb } from '@companion-module/base'

const ColorWhite = combineRgb(255, 255, 255) // White
const ColorBlack = combineRgb(0, 0, 0) // Black
const ColorGreen = combineRgb(0, 255, 0) // Green

function buildCameraButton(groupid, camid) {
	return {
		type: 'button',
		category: `Group ${groupid}`,
		name: `group${groupid}`,
		options: {},
		style: {
			text: 'Camera\n' + parseInt(groupid) + ':' + parseInt(camid),
			size: 'auto',
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: 'selectcam',
						options: {
							group: parseInt(groupid),
							id: parseInt(camid),
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'cameraIsSelected',
				options: { group: parseInt(groupid), id: parseInt(camid) },
				style: {
					color: ColorBlack,
					bgcolor: ColorGreen,
				},
			},
		],
	}
}

function buildCameraPresetButton(groupid, camid, presetid) {
	return {
		type: 'button',
		category: `Group ${groupid}`,
		name: `group${groupid}`,
		options: {},
		style: {
			text: 'Preset\n' + parseInt(groupid) + ':' + parseInt(camid) + ':' + parseInt(presetid),
			size: 'auto',
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: 'directpreset',
						options: {
							group: parseInt(groupid),
							id: parseInt(camid),
							preset: parseInt(presetid),
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'presetIsSelected',
				options: {
					group: parseInt(groupid),
					id: parseInt(camid),
					preset: parseInt(presetid),
				},
				style: {
					color: ColorBlack,
					bgcolor: ColorGreen,
				},
			},
		],
	}
}

function buildHDMIControlPreset(controlAndState) {
	return {
		type: 'button',
		category: `HDMI Control`,
		name: 'HDMIControl',
		options: {},
		style: {
			text: 'HDMI\n' + controlAndState.control,
			size: 'auto',
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: 'hdmioutput',
						options: {
							hdmicontrol: controlAndState.control,
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'HDMIState',
				options: { hdmistate: controlAndState.state },
				style: {
					color: ColorBlack,
					bgcolor: ColorGreen,
				},
			},
		],
	}
}

function buildCustomButtonPreset(buttonid) {
	return {
		type: 'button',
		category: `Trigger Custom Buttons`,
		name: 'triggerCustomButtons',
		options: {},
		style: {
			text: 'Button\n' + buttonid,
			size: 'auto',
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: 'custombutton',
						options: {
							buttonid: buttonid,
						},
					},
				],
			},
		],
	}
}

export function initPresets() {
	let presets = {}
	for (let groupid = 1; groupid <= 5; groupid++) {
		for (let camid = 1; camid <= 6; camid++) {
			let presetid = 0
			presets[`cameraPreset${groupid}_${camid}_${presetid}`] = buildCameraButton(groupid, camid)
			for (presetid = 1; presetid <= 5; presetid++) {
				presets[`cameraPreset${groupid}_${camid}_${presetid}`] = buildCameraPresetButton(groupid, camid, presetid)
			}
		}
	}
	let hdmiControlAndStates = [
		{ control: 'toggle', state: 'on' },
		{ control: 'on', state: 'on' },
		{ control: 'off', state: 'off' },
	]
	hdmiControlAndStates.forEach((pair) => {
		presets[`hdmiPreset${pair.control}`] = buildHDMIControlPreset(pair)
	})
	for (let buttonid = 1; buttonid <= 5; buttonid++) {
		presets[`customButton${buttonid}`] = buildCustomButtonPreset(buttonid)
	}
	this.setPresetDefinitions(presets)
	return presets
}
