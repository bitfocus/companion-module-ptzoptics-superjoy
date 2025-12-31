import {
  InstanceBase,
  runEntrypoint,
  InstanceStatus,
  combineRgb
} from '@companion-module/base'
import {
  configFields
} from './config.js'
import {
  upgradeScripts
} from './upgrade.js'
import {
  FIELDS
} from './fields.js'
import { 
  PTZSuperjoyVariables
} from './variables.js'
import { 
  PTZSuperjoyActions
} from './actions.js'
import { SuperJoyCommandError, handleError } from './error.js'
import { initPresets } from './presets.js'

class PTZSuperjoyInstance extends InstanceBase {
  selectedCam = 0;
  selectedPreset = new Map();

  initOrUpdateConfig(config, msg) {
    this.log('debug', `initOrUpdateConfig - config: ${JSON.stringify(config)}`)
    this.updateStatus(InstanceStatus.Connecting, msg)
    this.config = config
    this.pollStatusTimer = null
    this.log('debug', 'preVariables')
    this.variables = new PTZSuperjoyVariables(this)
    this.log('debug', 'preActions')
    this.actions = new PTZSuperjoyActions(this)
    this.log('debug', 'postActions')
    // this.initFeedbacks()
    // this.setPresetDefinitions(initPresets(this.config.cameracount,this.config.presetcount))

    if (this.config.controller !== undefined) {
      // if connection is made, this will set InstanceStatus.Ok 
      // otherwise it will print an error in the log if the request failed.
      this.updateState()
    } else {
      this.log('error', 'Please configure the controller ip address or host')
    }
  }

  configUpdated(config) {
    this.initOrUpdateConfig(config, 'configUpdated')
  }

  init(config) {
    this.initOrUpdateConfig(config, 'init')
  }

  sendInquiryCallback = (url, json, data) => {
    this.log('debug', `url: ${url} json is ${json} data is ${data}`)
    this.variables.updateVariables(json)
    if (this.pollingStatusTimer == null) {
      this.pollingStatusTimer = setInterval(this.sendInquiry, 1000)
    }
  }

  sendInquiry = () => {
    let argMap = new Map([
      ["action", "status"]
    ])
    this.sendCommand("inquiry", argMap, {function: this.sendInquiryCallback, data: null})
  }

  // UpdateState immediately queries the controller and updates the state.
  // This also begins the polling cycle. It is called after a connection 
  // is established, and whenever the module sends an Action that modifies 
  // the state of the controller so the state change is reflected as soon as possible.
  updateState() {
    // Stop any ongoing polling, we are going to restart it in the callback.
    if (this.pollingStatusTimer != null) {
      clearInterval(this.pollingStatusTimer)
      this.pollingStatusTimer = null
    }
    this.sendInquiry()
  }

  // Return config fields for web config
  getConfigFields() {
    return configFields
  }

  // When module gets deleted
  async destroy() {
    // Stop the polling timer
    if (this.pollingTimer !== undefined) {
      clearInterval(this.pollingTimer)
    }
  }

  async sendCommand(command, argMap, callback) {
    let url = `http://${this.config.controller}/cgi-bin/joyctrl.cgi?f=${command}`
    argMap.forEach((value, key) => {
      url = url + `&${key}=${value}`
    })
    this.log('debug', `url: ${url}`)
    fetch(url)
      .then(response => {
        if (response.status != 200) {
          throw new SuperJoyCommandError(
            `Error response - expected 200, got ${response.status}`, 
            {url: url, caller: this}
          )
        }
        return response.json()
      })
      .then(json => {
          this.log('debug', `json = ${JSON.stringify(json)}`)
        callback.function(url, json, callback.data)
      })
      .catch((e) => {
        this.log('debug', 'SendCommand catch')
        handleError(e)
      })
  }
}

runEntrypoint(PTZSuperjoyInstance, upgradeScripts)
