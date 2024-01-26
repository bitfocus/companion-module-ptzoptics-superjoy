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
		default: 12,
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
  
/*
	PollInterval: {
		type: 'number',
		label: 'Poll Interval (ms) (0 to disable)',
		id: 'interval',
		default: 0,
		min: 0,
	},
  */
}
