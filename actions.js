import {
  FIELDS
} from './fields.js'

export class PTZSuperjoyActions {
	constructor (superjoyInstance) {
		this.superjoyInstance = superjoyInstance
		this.initActions()
	}

	actionCallback = (url, json, data) => {
		this.superjoyInstance.log('debug', `action callback - json: ${json}, data: ${data}`)
		if (json.result !== "0") {
	    	throw new SuperJoyCommandError(
				`Result is ${json.result}, expect zero`,
					{url: url, caller: this}
				  )
			
		}
		this.superjoyInstance.updateState()
	}

	initActions() {
		let actions = {
		  selectcam: {
				name: 'Select Camera',
				options: [FIELDS.Group, FIELDS.Camera],
				callback: async (action, context) => {
					let command = "camselect"
					let argMap = new Map([
						["group", action.options.group],
						["camid", action.options.id]
					])
		  			this.superjoyInstance.sendCommand(command, argMap, 
						{function: this.actionCallback, data: null}
					)
				}
			},
	  		directpreset: {
				name: 'Direct Preset',
				options: [FIELDS.Group, FIELDS.Camera, FIELDS.Preset, FIELDS.Speed],
				callback: async (action, context) => {
					let command = "directpresets"
					let argMap = new Map([
						["action", "recall"],
						["group", action.options.group],
						["camid", action.options.id],
						["preset", action.options.preset],
						["presetspeed", action.options.speed]
					])
		  			this.superjoyInstance.sendCommand("directpresets", argMap, 
												{function: this.actionCallback, data: null}
					)
				}
	  		},
		}
		this.superjoyInstance.setActionDefinitions(actions)
	}
}