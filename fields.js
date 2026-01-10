export const FIELDS = {
	Camera: {
		type: 'textinput',
		label: 'Camera ID',
		id: 'id',
		default: 1,
		useVariables: true,
	},

	Preset: {
		type: 'textinput',
		label: 'Preset (1 - 255',
		id: 'preset',
		default: 0,
		useVariables: true,
	},

	Speed: {
		type: 'textinput',
		label: 'Preset Speed (1 - 24)',
		id: 'speed',
		default: 24,
		useVariables: true,
	},

	Group: {
		type: 'textinput',
		label: 'Group (1 - 5)',
		id: 'group',
		default: 1,
		useVariables: true,
	},

	HDMIControl: {
		type: 'dropdown',
		id: 'hdmicontrol',
		label: 'Choose Control Behavior',
		default: 'toggle',
		choices: [
			{ id: 'toggle', label: 'Toggle' },
			{ id: 'off', label: 'Off' },
			{ id: 'on', label: 'On' },
		],
	},

	HDMIState: {
		type: 'dropdown',
		id: 'hdmistate',
		label: 'HDMI State',
		default: 'on',
		choices: [
			{ id: 'off', label: 'Off' },
			{ id: 'on', label: 'On' },
		],
	},

	CustomButton: {
		type: 'textinput',
		id: 'buttonid',
		label: 'Custom Button to Trigger (1 - 5)',
		default: 1,
		useVariables: true,
	},
}
