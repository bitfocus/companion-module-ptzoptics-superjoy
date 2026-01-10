/**
 * Declaration of variables defined by the module
 */
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

/**
 * Class for runtime initialization and updating of the variables.
 * @class
 */
export class PTZSuperJoyVariables {
	/**
	 * Reference to the SuperJoy Instance for the module.
	 * It stored in the class so it can update the module.
	 * @param {PTZSuperJoyInstance} superJoyInstance
	 */
	superJoyInstance = null

	/**
	 * Object maintaining the current value of all variables.
	 * @param {Object} valueCache
	 */
	valueCache = {}

	/**
	 * Constuctor that takes a reference to the SuperJoy Instance
	 * @param {PTZSuperJoyInstance} superJoyInstance
	 */
	constructor(superJoyInstance) {
		// superJoyIntance is the main class inherited from CompanionBase
		this.superJoyInstance = superJoyInstance
		// valueCache holds all the current values of variables
		this.valueCache = {}
		this.initVariables()
	}

	/**
	 * Initialize all variables.
	 */
	initVariables() {
		this.superJoyInstance.setVariableDefinitions(VARIABLES)
	}

	/**
	 * Update the value of all variables in response to an Inquiry command. It compares the values
	 * reported by `polledValues` to the `valueCache` and updates and variables that have changed.
	 * @param {JSON} polledValues
	 */
	updateVariables(polledValues) {
		// this.superJoyInstance.log('debug', `updating variables - polledValues= ${JSON.stringify(polledValues)})`)
		if (polledValues === undefined) {
			return
		}

		let newValues = {}
		for (const v of VARIABLES) {
			let key = v.variableId
			switch (key) {
				case 'group':
				case 'camid':
				case 'preset':
				case 'hdmi':
					{
						// The incoming values are JSON objects, so we need to stringify them to store the
						// variables as text values.
						if (!Object.hasOwn(polledValues, key)) {
							this.superJoyInstance.log(
								'warn',
								`updateVariables: polled_values missing key ${key}, polled_values = ${JSON.stringify(polledValues)}`,
							)
							return
						}
						let stringVal = JSON.stringify(polledValues[key])
						if (this.valueCache[key] !== stringVal) {
							newValues[key] = this.valueCache[key] = stringVal
						}
					}
					break
				default:
					this.superJoyInstance.log('warn', `updateVariables: unhandled variable key ${key}`)
					break
			}
		}
		if (Object.keys(newValues).length > 0) {
			this.superJoyInstance.log('debug', `updating variables - newValues= ${JSON.stringify(newValues)}`)
			this.superJoyInstance.setVariableValues(newValues)
		}
	}

	/**
	 * Get the value of a variable
	 * @param {string} name Name of the variable to retrieve.
	 * @returns
	 */
	getVariable(name) {
		return this.valueCache[name]
	}
}
