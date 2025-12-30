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
import { initPresets } from './presets.js'

class PTZSuperjoyInstance extends InstanceBase {
  selectedCam = 0;
  selectedPreset = new Map();

  initOrUpdateConfig(config, msg) {
    this.log('debug', `initOrUpdateConfig - config: ${JSON.stringify(config)}`)
    this.updateStatus(InstanceStatus.Connecting, msg)
    this.config = config
    this.pollStatusTimer = null
    this.variables = new PTZSuperjoyVariables(this)

    this.initActions()
    this.initFeedbacks()
    this.setPresetDefinitions(initPresets(this.config.cameracount,this.config.presetcount))

    if (this.config.controller !== undefined) {
      // This will set InstanceStatus.Ok if connection is made.
      this.updateCamStatus()
    } else {
      this.log('error', 'Please configure the controller ip address or host')
    }
  }

  configUpdated(config) {
    this.initOrUpdateConfig(config, 'configUpdated')
  }

  init(config) {
    this.initOrUpdateConfig(config, 'init')
    // Start polling after construction of all objects
    // this.startPolling()
  }
  
  pollStatus() {
    this.updateCamStatus()
  }

  startPollingStatus() {
    this.stopPollingStatus()
    this.pollStatus()
    this.pollingStatusTimer = setInterval(this.pollStatus.bind(this), 1000)
  }

  stopPollingStatus() {
    clearInterval(this.pollingStatusTimer)
    this.pollingStatusTimer = null
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

  initActions() {
    const urlLabel = this.config.prefix ? 'URI' : 'URL'

    this.setActionDefinitions({
      selectcam: {
        name: 'Select Camera',
        options: [FIELDS.Camera],
        callback: async (action, context) => {
          let url = `http://${this.config.controller}/cgi-bin/joyctrl.cgi?f=camselect&group=${this.config.group}&camid=${action.options.id}`
          this.log('info', 'Testing camera select')
          try {
            fetch(url)
              .then(response => response.text())
              .then(text => {
                if (text === 'OK') {
                  this.log('debug', 'Result was OK')
                  this.updateStatus(InstanceStatus.Ok)
                  this.selectedCam = action.options.id
                  this.log('info', `Selected cam is ${this.selectedCam}`)
                  this.updateCamStatus()
                  this.checkFeedbacks()

                } else {
                  this.updateStatus(InstanceStatus.UnknownError, text)
                }
              })
          } catch (e) {
            this.log('error', `HTTP GET Request failed`)
            this.updateStatus(InstanceStatus.UnknownError, e.code)
          }
        },
      },
      directpreset: {
        name: 'Direct Preset',
        options: [FIELDS.Camera, FIELDS.Group, FIELDS.Preset, FIELDS.Speed],
        callback: async (action, context) => {
          let url = `http://${this.config.controller}/cgi-bin/joyctrl.cgi?f=directpresets&action=recall&group=${this.config.group}&camid=${action.options.id}&preset=${action.options.preset}&presetspeed=${action.options.speed}`
          try {
            fetch(url)
              .then(response => response.text())
              .then(text => {
                this.log('info', text)
                if (text === 'OK') {
                  this.log('debug', 'Result was OK')
                  this.updateStatus(InstanceStatus.Ok)
                  this.selectedCam = action.options.id
                  this.selectedPreset[action.options.id] = action.options.preset
                  this.log('info', `Selected cam is ${this.selectedCam}`)
                  this.log('info', `Selected preset for this cam is ${this.selectedPreset[action.options.id]}`)
                  this.checkFeedbacks()
                } else {
                  this.updateStatus(InstanceStatus.UnknownError, text)
                }
              })

          } catch (e) {
            this.log('error', `HTTP GET Request failed`)
            this.updateStatus(InstanceStatus.UnknownError, e.code)
          }
        },
      },

    })
  }

  initFeedbacks() {
    this.setFeedbackDefinitions({
      camIsSelected: {
        type: 'boolean',
        name: 'Is Camera Selected',
        options: [FIELDS.Camera],
        subscribe: (feedback) => {},
        unsubscribe: (feedback) => {},
        callback: (feedback) => {
          this.log('debug', `Received selected cam feedback request for ${feedback.id} - ${feedback.options.id} - current selection s ${this.selectedCam}`)
          if (this.selectedCam == feedback.options.id) {
            return true
          }
          return false
        },
      },
      camIsPreset: {
        type: 'boolean',
        name: 'Is Preset Selected',
        options: [FIELDS.Camera, FIELDS.Preset],
        subscribe: (feedback) => {},
        unsubscribe: (feedback) => {},
        callback: (feedback) => {
          //          this.log('info',`Received preset feedback request for ${feedback.id} - ${feedback.options.id}`)
          if (this.selectedPreset[feedback.options.id] == feedback.options.preset) {
            return true
          }
          return false
        },
      },
      camIsPresetAndSelected: {
        type: 'boolean',
        name: 'Is Camera and Preset Selected',
        options: [FIELDS.Camera, FIELDS.Preset],
        subscribe: (feedback) => {},
        unsubscribe: (feedback) => {},
        callback: (feedback) => {
          //          this.log('info',`Received preset feedback request for ${feedback.id} - ${feedback.options.id}`)
          if (this.selectedCam == feedback.options.id && this.selectedPreset[feedback.options.id] == feedback.options.preset) {
            return true
          }
          return false
        },
      },

    })
    this.log('debug', `Done setting feedback definitions - selected cam is stored as ${this.selectedCam}`)

    //    this.updateCamStatus(1)
  }
  
  updateCamStatus() {
    if (this.config.controller === '') {
      this.log('error', 'Controller address not configured!')
      return
    }
    let url = `http://${this.config.controller}/cgi-bin/joyctrl.cgi?f=inquiry&action=status`
    this.log('debug', `Fetching current state`)
      fetch(url)
        .then(response => {
          if (response.status == 200) {
            this.updateStatus(InstanceStatus.Ok)
            return response.json()
          }
          this.log('error', `Fetching cam status returned unexpected status=${response.status} (expected 200)`)
          return null
        })
        .then(response => {
          this.log('debug', `processing response ${JSON.stringify(response)}`)
          if (response && response.group === this.config.group) {
            this.log('info', `Status query says current selected camera is ${response.camid} preset ${response.preset}`)
            this.selectedCam = response.camid
            this.selectedPreset[response.camid] = response.preset
            this.checkFeedbacks()
          }
          this.log('debug', `calling update ${JSON.stringify(response)}`)
          this.variables.updateVariables(response)
          this.log('debug', `after update ${JSON.stringify(response)}`)
          return null
        })
        .catch ((e) => {
          this.log('error', `HTTP GET Request failed, please check 'Controller IP or Host' in the emodule configuration`)
          this.updateStatus(InstanceStatus.UnknownError, e.code)
        })
  }

/*
  initPresets() {
    const presets = {}
    this.log('info', 'Adding presets')
    for (var cam = 1; cam < 6; cam++) {
      presets[`cam${cam}select`] = {
        type: 'button', // This must be 'button' for now
        category: `Camera ${cam}`, // This groups presets into categories in the ui. Try to create logical groups to help users find presets
        name: `Camera ${cam} Select`, // A name for the preset. Shown to the user when they hover over it
        style: {
          //		text: `$(ptzoptics-superjoy:)`, // You can use variables from your module here
          text: `Cam ${cam}`,
          size: 'auto',
          color: combineRgb(255, 255, 255),
          bgcolor: combineRgb(0, 0, 0),
        },
        steps: [{
          down: [{
            // add an action on down press
            actionId: 'selectcam',
            options: {
              // options values to use
              group: 1,
              speed: 12,
              id: cam,
            },
          }, ],
          up: [],
        }, ],
        feedbacks: [{
          feedbackId: 'camIsSelected',
          options: {
            // options values to use
            group: 1,
            speed: 1,
            id: cam,
          },
          style: {
            bgcolor: combineRgb(0, 204, 0),
          }
        }, ], // You can add some presets from your module here
      }
      this.log('info', `Adding cam ${cam} presets`)
      for (var preset = 1; preset < 6; preset++) {
        presets[`cam${cam}preset${preset}`] = {
          type: 'button', // This must be 'button' for now
          category: `Camera ${cam}`, // This groups presets into categories in the ui. Try to create logical groups to help users find presets
          name: `Camera ${cam} Preset ${preset}`, // A name for the preset. Shown to the user when they hover over it
          style: {
            //		text: `$(ptzoptics-superjoy:)`, // You can use variables from your module here
            text: `Cam ${cam} Preset ${preset}`,
            size: 'auto',
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(0, 0, 0),
          },
          steps: [{
            down: [{
              // add an action on down press
              actionId: 'directpreset',
              options: {
                // options values to use
                group: 1,
                speed: 1,
                id: cam,
                preset: preset,
              },
            }, ],
            up: [],
          }, ],
          feedbacks: [{
            feedbackId: 'camIsSelected',
            options: {
              // options values to use
              group: 1,
              speed: 1,
              id: cam,
              preset: preset,
            },
            style: {
              color: combineRgb(0, 204, 0),
            }
          }, {
            feedbackId: 'camIsPreset',
            options: {
              // options values to use
              group: 1,
              speed: 1,
              id: cam,
              preset: preset,
            },
            style: {
              bgcolor: combineRgb(0, 51, 204)
            }
          }],
        }
      }
    }
    return presets
  }
  */
}

runEntrypoint(PTZSuperjoyInstance, upgradeScripts)
