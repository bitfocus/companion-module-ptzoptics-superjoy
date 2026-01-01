const VARIABLES = [
	{
		variableId: 'group',
		name: 'Currently Selected Camera Group',
	},
	{
		variableId: 'camid',
		name: 'Currently Selected Camera Id',
	},
	{
		variableId: 'preset',
		name: 'Currently Selected Camera Preset',
	},
	{
		variableId: 'hdmi',
		name: 'Holds the on/off state of the HDMI port',
	},
]

export class PTZSuperJoyVariables {
	constructor(superJoyInstance) {
		// superJoyIntance is the main class inherited from CompanionBase
		this.superJoyInstance = superJoyInstance
		// valueCache holds all the current values of variables
		this.valueCache = {}
		this.initVariables()
	}

	initVariables() {
		this.superJoyInstance.setVariableDefinitions(VARIABLES)
	}

	updateVariables(polledValues) {
		// this.superJoyInstance.log('debug', `updating variables - polledValues= ${JSON.stringify(polledValues)})`);
		if (polledValues === undefined) {
			return
		}

		let newValues = {}

		for (const v of VARIABLES) {
			let key = v.variableId
			if (key in polledValues && this.valueCache[key] !== polledValues[key]) {
				newValues[key] = this.valueCache[key] = polledValues[key]
			}
		}
		if (Object.keys(newValues).length > 0) {
			this.superJoyInstance.log('debug', `updating variables - newValues= ${JSON.stringify(newValues)}`)
			this.superJoyInstance.setVariableValues(newValues)
		}
	}

	getVariable(name) {
		return this.valueCache[name]
	}
}
