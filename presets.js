import { combineRgb } from '@companion-module/base'

const ColorWhite = combineRgb(255, 255, 255) // White
const ColorBlack = combineRgb(0, 0, 0) // Black
const ColorGreen = combineRgb(0, 255, 0) // Green

/**
 * Build a text header for the Group/Camera header.
 * @param {number} groupid Group ID used to specify category
 * @param {number} camid Camera ID used to specify category
 * @param {string} text Text to display in the header
 * @returns
 */
function buildCameraHeaderText(groupid, camid, text) {
	return {
		type: 'text',
		category: `Group ${groupid} Camera ${camid}`,
		name: text,
	}
}
/**
 * Build a preset button for the 'camselect' action with a 'cameraIsSelectedFeedback'
 * @param {number} groupid Group to which the camera belongs
 * @param {number} camid Camera id within the group
 * @returns {Button}
 */
function buildCameraButton(groupid, camid) {
	return {
		type: 'button',
		category: `Group ${groupid} Camera ${camid}`,
		name: `group${groupid}`,
		options: {},
		style: {
			size: 14,
			text: 'Group ' + parseInt(groupid) + '\n' + 'Camera ' + parseInt(camid),
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: 'camselect',
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

/**
 * Build a Preset button to select a group, Camera, and optionally, Preset.
 * @param {string} action Action placed on the button: 'currentpreset' or 'directpreset'
 * @param {number} groupid Group ID to select
 * @param {number} camid Camera ID to select
 * @param {number} presetid Preset ID to select (only used when action is 'directpreset')
 * @param {number} speed Preset Speed for preset (only used when action is 'directpreset')
 * @returns {Button}
 */
function buildCameraPresetButton(action, groupid, camid, presetid, speed) {
	let options = {}
	let text
	switch (action) {
		case 'currentpreset':
			options = {
				preset: parseInt(presetid),
				speed: parseInt(speed),
			}
			text = 'Preset ' + parseInt(presetid)
			break
		case 'directpreset':
			options = {
				group: parseInt(groupid),
				id: parseInt(camid),
				preset: parseInt(presetid),
				speed: parseInt(speed),
			}
			text = 'Group ' + parseInt(groupid) + '\n' + 'Camera ' + parseInt(camid) + '\n' + 'Preset ' + parseInt(presetid)
			break
	}
	return {
		type: 'button',
		category: `Group ${groupid} Camera ${camid}`,
		name: `group${groupid}`,
		options: {},
		style: {
			text: text,
			size: 14,
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [
					{
						actionId: action,
						options: options,
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

/**
 * Build an HDMI Control Preset
 * @param {string} control Action generated: 'toggle', 'on', or 'off'.
 * @param {string} state Feedback generated: 'on or 'off.
 * @returns {Button}
 */
function buildHDMIControlPreset(control, state) {
	return {
		type: 'button',
		// This category is carefully named to be alphabetically before the Camera groups
		// This makes it occur at the top of the preset list so it isn't buried under
		// 30 Group/Camera presets.
		category: `Control HDMI Output`,
		name: 'HDMIControl',
		options: {},
		style: {
			text: 'HDMI\n' + control,
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
							hdmicontrol: control,
						},
					},
				],
			},
		],
		feedbacks: [
			{
				feedbackId: 'HDMIState',
				options: { hdmistate: state },
				style: {
					color: ColorBlack,
					bgcolor: ColorGreen,
				},
			},
		],
	}
}

/**
 * Build a Preset Button to activate a Custom Button on the Controller.
 * @param {number} buttonid
 * @returns {Button}
 */
function buildCustomButtonPreset(buttonid) {
	return {
		type: 'button',
		// This category is carefully named to be alphabetically before the Camera groups
		// This makes it occur at the top of the preset list so it isn't buried under
		// 30 Group/Camera presets.
		category: `Custom Button Trigger`,
		name: 'triggerCustomButtons',
		options: {},
		style: {
			text: 'Custom\n' + buttonid,
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

/**
 * Initialize Presets
 * @returns {Buttons}
 */
export function initPresets() {
	let presets = {}
	for (let groupid = 1; groupid <= 5; groupid++) {
		for (let camid = 1; camid <= 6; camid++) {
			presets[`cameraHeaderText_${groupid}_${camid}`] = buildCameraHeaderText(groupid, camid, 'Select Camera')
			presets[`cameraPreset${groupid}_${camid}`] = buildCameraButton(groupid, camid)
			presets[`cameraHeaderText_current_${groupid}_${camid}`] = buildCameraHeaderText(
				groupid,
				camid,
				'Recall Preset on current Camera',
			)
			for (let presetid = 0; presetid <= 5; presetid++) {
				presets[`currentPreset${groupid}_${camid}_${presetid}`] = buildCameraPresetButton(
					'currentpreset',
					groupid,
					camid,
					presetid,
				)
			}
			presets[`cameraHeaderText_direct_${groupid}_${camid}`] = buildCameraHeaderText(
				groupid,
				camid,
				'Recall Preset directly on specified Group and Camera',
			)
			for (let presetid = 0; presetid <= 5; presetid++) {
				presets[`directPreset${groupid}_${camid}_${presetid}`] = buildCameraPresetButton(
					'directpreset',
					groupid,
					camid,
					presetid,
				)
			}
		}
	}
	let hdmiControlAndStates = [
		{ control: 'toggle', state: 'on' },
		{ control: 'on', state: 'on' },
		{ control: 'off', state: 'off' },
	]
	hdmiControlAndStates.forEach((pair) => {
		presets[`hdmiPreset${pair.control}`] = buildHDMIControlPreset(pair.control, pair.state)
	})
	for (let buttonid = 1; buttonid <= 5; buttonid++) {
		presets[`customButton${buttonid}`] = buildCustomButtonPreset(buttonid)
	}
	this.setPresetDefinitions(presets)
	return presets
}
