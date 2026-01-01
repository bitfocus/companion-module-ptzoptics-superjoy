import {
  FIELDS
} from './fields.js'

export class PTZSuperJoyActions {
	constructor (superJoyInstance) {
		this.superJoyInstance = superJoyInstance
		this.initActions()
	}

	actionCallback = (url, json, data) => {
		if (json.result !== "0") {
	    	throw new SuperJoyCommandError(
				`Result is ${json.result}, expect zero`,
					{url: url, caller: this}
				  )
			
		}
		this.superJoyInstance.updateState()
	}

	initActions() {
		let actions = {
		  hdmioutput: {
			name: "HDMI Output Control",
			options: [FIELDS.HDMIControl],
			callback: async (action, context) => {
					let argMap = new Map([
						["action", action.options.hdmicontrol]
					])
		  			this.superJoyInstance.sendCommand("hdmiout", argMap,
						{function: this.actionCallback, data: null}
					)
				}
		  },
		  custombutton: {
			name: "Trigger Custom Button",
			options: [FIELDS.CustomButton],
			callback: async (action, context) => {
					let argMap = new Map([
						["action", "trigger"],
						["buttonid", action.options.buttonid]
					])
		  			this.superJoyInstance.sendCommand("custom", argMap, 
						{function: this.actionCallback, data: null}
					)
				}
		  },
		  selectcam: {
			name: 'Select Group and Camera',
			options: [FIELDS.Group, FIELDS.Camera],
			callback: async (action, context) => {
					let argMap = new Map([
						["group", action.options.group],
						["camid", action.options.id]
					])
		  			this.superJoyInstance.sendCommand("camselect", argMap, 
						{function: this.actionCallback, data: null}
					)
				}
		},
	  	directpreset: {
			name: 'Select Group, Camera, and Preset',
			options: [FIELDS.Group, FIELDS.Camera, FIELDS.Preset, FIELDS.Speed],
			callback: async (action, context) => {
					let argMap = new Map([
						["action", "recall"],
						["group", action.options.group],
						["camid", action.options.id],
						["preset", action.options.preset],
						["presetspeed", action.options.speed]
					])
					this.superJoyInstance.sendCommand("directpresets", argMap, 
											{function: this.actionCallback, data: null}
					)
				}
	  	},
		currentpreset: {
			name: 'Select Preset on Current Camera',
			options: [FIELDS.Preset, FIELDS.Speed],
			callback: async (action, context) => {
					let argMap = new Map([
						["action", "recall"],
						["preset", action.options.preset],
						["presetspeed", action.options.speed]
					])
					this.superJoyInstance.sendCommand("presets", argMap, 
											{function: this.actionCallback, data: null}
					)
				}
	  		},
		}
		this.superJoyInstance.setActionDefinitions(actions)
	}
}