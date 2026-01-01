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
  PTZSuperJoyVariables
} from './variables.js'
import { 
  PTZSuperJoyActions
} from './actions.js'
import { SuperJoyCommandError, handleError } from './error.js'
import { initPresets } from './presets.js'
import { initFeedbacks } from './feedbacks.js'

/**
 * Main class for the PTZOptics SuperJoy Companion Module
 * @class
 * @extends InstanceBase
 */
class PTZSuperJoyInstance extends InstanceBase {

  //
  init(config) {
    this.initOrUpdateConfig(config, 'init')
  }

  configUpdated(config) {
    this.initOrUpdateConfig(config, 'configUpdated')
  }

  initOrUpdateConfig(config, msg) {
    this.log('debug', `initOrUpdateConfig - config: ${JSON.stringify(config)}`)
    this.config = config
    this.pollStatusTimer = null
    this.instanceStatus = null

    this.updateInstanceStatus(InstanceStatus.Connecting, msg)
    this.log('debug', 'preVariables')
    this.variables = new PTZSuperJoyVariables(this)
    this.log('debug', 'preActions')
    this.actions = new PTZSuperJoyActions(this)
    this.log('debug', 'preFeedbacks')
    this.feedbacks = initFeedbacks.bind(this)()
    this.log('debug', 'postFeedbacks')
    this.presets = initPresets.bind(this)()
    this.log('debug', 'postPresets')
    if (this.config.controller !== undefined) {
      this.updateState()
    } else {
      this.log('error', 'Please configure the controller ip address or host')
    }
  }

  // updateInstanceStatus updates the Companion connection status.
  // It wraps updateStatus() so that we only call it when it changes.
  // This keeps the debug logs from filling up with 'OK' status settings
  // during polling.
  updateInstanceStatus(newStatus) {
    if (this.instanceStatus != newStatus) {
      this.instanceStatus = newStatus
      this.updateStatus(newStatus)
    }
  }

  sendInquiryCallback = (url, json, data) => {
    // this.log('debug', `url: ${url} json is ${json} data is ${data}`)
    this.variables.updateVariables(json)
    this.checkFeedbacks()
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
    fetch(url)
      .then(response => {
        if (response.status != 200) {
          throw new SuperJoyCommandError(
            `Error response - expected 200, got ${response.status}`, 
            {url: url, caller: this}
          )
        }
        this.updateInstanceStatus('ok')
        return response.json()
      })
      .then(json => {
        callback.function(url, json, callback.data)
      })
      .catch((e) => {
        handleError(e)
      })
  }
}

runEntrypoint(PTZSuperJoyInstance, upgradeScripts)
