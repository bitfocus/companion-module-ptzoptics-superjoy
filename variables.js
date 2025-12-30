
export class PTZSuperjoyVariables {
	constructor (companion_instance) {
		this.superjoyInstance = companion_instance
		// this.superjoyInstance.updateVariables = this.updateVariables
		this.valueCache = {}
		this.initVariables()
	}
    
	initVariables() {
		const variables = [
			{
				variableId: 'selected_group',
				name: "Currently Selected Camera Group"
			},
			{
				variableId: 'selected_camid',
				name: "Currently Selected Camera Id"
			},
			{
				variableId: 'selected_preset', 
				name: "Currently Selected Camera Preset"
			},
		]
		this.superjoyInstance.setVariableDefinitions(variables)
	}

	updateVariables (polledValues) {
		this.superjoyInstance.log('debug', `updating variables - polledValues= ${JSON.stringify(polledValues)}`);
		if (polledValues === undefined)
			return

		let newValues = {};
	
		if (this.valueCache?.selected_group !== polledValues.group) {
			newValues.selected_group = this.valueCache.selected_group = polledValues.group
		}
		if (this.valueCache?.selected_camid !== polledValues.camid) {
			newValues.selected_camid = this.valueCache.selected_camid = polledValues.camid
		}
		if (this.valueCache?.selected_preset !== polledValues.preset) {
			newValues.selected_preset = this.valueCache.selected_preset = polledValues.preset
		}
		this.superjoyInstance.log('debug', `updating variables - newValues= ${JSON.stringify(newValues)}`);		
		if (Object.keys(newValues).length > 0) {
			this.superjoyInstance.setVariableValues(newValues)
		}
	}
}

// module.exports = async function (self) {
//	self.setVariableDefinitions([
//		{ variableId: 'selectedcam', name: 'Currently Selected Camera' }
//	])
//}