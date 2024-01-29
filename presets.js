import { combineRgb } from '@companion-module/base'

export function initPresets(camcount,presetcount) {
  const presets = {}
  for (var cam = 1; cam <= camcount; cam++) {
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
    for (var preset = 1; preset <= presetcount; preset++) {
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