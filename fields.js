export const FIELDS = {
	Camera: {
		type: 'number',
		label: 'Camera ID',
		id: 'id',
		default: 1,
		min: 1,
		max: 255,
		useVariables: 'true',
	},

	Preset: {
		type: 'number',
		label: 'Preset',
		id: 'preset',
		default: 1,
		min: 1,
		max: 255,
		useVariables: true,
	},

	Speed: {
		type: 'number',
		label: 'Preset Speed',
		id: 'speed',
		default: 24,
		min: 1,
		max: 24,
		useVariables: true,
	},

	Group: {
		type: 'number',
		label: 'Group',
		id: 'group',
		default: 1,
		min: 1,
		max: 5,
		useVaribles: true,
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
		useVariables: true,
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
		useVariables: true,
	},

	CustomButton: {
		type: 'dropdown',
		id: 'buttonid',
		label: 'Custom Button to Trigger',
		default: 1,
		choices: [
			{ id: 1, label: 'Button 1' },
			{ id: 2, label: 'Button 2' },
			{ id: 3, label: 'Button 3' },
			{ id: 4, label: 'Button 4' },
			{ id: 5, label: 'Joystick' },
		],
		useVariables: true,
	},
}
