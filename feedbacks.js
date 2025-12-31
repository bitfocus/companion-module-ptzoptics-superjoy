// const { combineRgb } = require('@companion-module/base')
/*
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
          if (this.variables.getVariable['camid'] == feedback.options.id) {
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
          if (this.variables.getVariable('camid') == feedback.options.id) {
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
          if (this.variables.getVariable('camid') == feedback.options.id && this.selectedPreset[feedback.options.id] == feedback.options.preset) {
            return true
          }
          return false
        },
      },

    })
    this.log('debug', `Done setting feedback definitions - selected cam is stored as ${this.selectedCam}`)

    //    this.updateCamStatus(1)
  }*/