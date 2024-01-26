export const configFields = [
	{
		type: 'textinput',
		id: 'controller',
		label: 'Controller IP or Host',
		width: 12,
		default: '',
	},
	{
		type: 'dropdown',
		id: 'group',
		label: 'Camera Group',
		width: 6,
		default: 1,
		choices: [
			{ id: 1, label: 'Group 1' },
			{ id: 2, label: 'Group 2' },
      { id: 3, label: 'Group 3' },
      { id: 4, label: 'Group 4' },
      { id: 5, label: 'Group 5' },
		],
	},
]
