import { combineRgb } from '@companion-module/base'
/*
func initPresets(){
  const presets = {}

  for (var cam = 1; preset < 6; cam++) {
      this.log('info',`Adding cam ${cam} presets`)
      for (var preset = 1; preset < 6; preset++) {
        presets[`cam${cam}preset${preset}`] = {
      	type: 'button', // This must be 'button' for now
      	category: `${cam}`, // This groups presets into categories in the ui. Try to create logical groups to help users find presets
      	name: `Camera ${cam} Preset ${preset}`, // A name for the preset. Shown to the user when they hover over it
      	style: {
      //		text: `$(ptzoptics-superjoy:)`, // You can use variables from your module here
          text: `Cam ${cam} Preset ${preset}`,
      		size: 'auto',
      		color: combineRgb(255, 255, 255),
      		bgcolor: combineRgb(0, 0, 0),
      	},
      	steps: [
      		{
      			down: [
      				{
      					// add an action on down press
      					actionId: 'directpreset',
      					options: {
      						// options values to use
                  group: 1,
                  speed: 1,
      						id: cam,
                  preset: preset,
      					},
      				},
      			],
      			up: [],
      		},
      	],
      	feedbacks: [
      	  {
      	    feedbackId: 'camIsSelected',
      			options: {
      				// options values to use
              group: 1,
              speed: 1,
      				id: cam,
              preset: preset,
      			},
            style: {
              color: combineRgb(0,204,0),
            }
      	  },
          {
            feedbackId: 'camIsPreset',
      			options: {
      				// options values to use
              group: 1,
              speed: 1,
      				id: cam,
              preset: preset,
      			},
            style: {
              bgcolor: combineRgb(0,51,204)
            }
          }
      	], // You can add some presets from your module here
      }
     }
    }
  return presets
}
*/
