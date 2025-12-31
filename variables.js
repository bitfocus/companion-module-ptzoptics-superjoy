
const VARIABLES = [
	{
		variableId: 'group',
		name: "Currently Selected Camera Group"
	},
	{
		variableId: 'camid',
		name: "Currently Selected Camera Id"
	},
	{
		variableId: 'preset', 
		name: "Currently Selected Camera Preset"
	},
	{
		variableId: 'hdmi', 
		name: "Holds the on/off state of the HDMI port"
	},
]

export class PTZSuperjoyVariables {
	constructor (superjoyInstance) {
		// superjoyIntance is the main class inherited from CompanionBase
		this.superjoyInstance = superjoyInstance
		// valueCache holds all the current values of variables
		this.valueCache = {}
		this.initVariables()
	}
   
	initVariables() {
		this.superjoyInstance.setVariableDefinitions(VARIABLES)
	}

	updateVariables (polledValues) {
		this.superjoyInstance.log('debug', `updating variables - polledValues= ${JSON.stringify(polledValues)})`);
		if (polledValues === undefined) {
			return
		}

		let newValues = {};

		for (const v of VARIABLES) {
			let key = v.variableId
			if (key in polledValues && this.valueCache[key] !== polledValues[key]) {
				newValues[key] = this.valueCache[key] = polledValues[key]
			}
		}
		this.superjoyInstance.log('debug', `updating variables - newValues= ${JSON.stringify(newValues)}`);		
		if (Object.keys(newValues).length > 0) {
			this.superjoyInstance.setVariableValues(newValues)
		}
	}

	getVariable(name) {
		return this.valueCache[name]
	}
}
