/**
 * Array of scripts executed to to update configuration when changed.
 * Updates from 1.0.0 to 2.0.0 version.
 */
export const upgradeScripts = [
	function (context, props) {
		//White Balance mode change
		let changed = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		// The 1.0.0 version had multiple configuration parameters:
		//     controller: Value of the ip address or host
		//     group: Camera group that was implied for all uses of Camera Group
		//     cameracount: Used only to generate presets
		//     presetcount: Used only to generate presets
		if (
			props.config == null ||
			!(
				'controller' in props.config &&
				'group' in props.config &&
				'cameracount' in props.config &&
				'presetcount' in props.config
			)
		) {
			// This isn't a 1.0.0 upgrade
			return changed
		}

		// Version 2.0.0 only has:
		//     controller: With the same meaning
		changed.updatedConfig = { controller: props.config.controller }

		// For Actions and Feedbacks, we need to store the value of 'group'
		// from the 1.0.0 config and apply it to all of the actions and feedbacks
		// where it was being used as a default.
		let originalGroup = props.config.group
		props.actions.forEach((action) => {
			switch (action.actionId) {
				case 'selectcam':
				case 'directpreset':
					action.options.group = originalGroup
					changed.updatedActions.push(action)
					console.log(`SuperJoy Upgrade 1.0.0: Action ${JSON.stringify(action)}`)
					break
				default:
					console.log(`SuperJoy Upgrade 1.0.0: Unexpected actionId ${action.actionId}`)
					break
			}
		})

		// 1.0.0 had different feedbackIds and two of them did the same thing.
		// Map the feedbackIds from the old to the new.
		let nameMap = {
			camIsSelected: 'cameraIsSelected',
			camIsPreset: 'presetIsSelected',
			camIsPresetAndSelected: 'presetIsSelected',
		}
		props.feedbacks.forEach((feedback) => {
			switch (feedback.feedbackId) {
				case 'camIsSelected':
				case 'camIsPreset':
				case 'camIsPresetAndSelected':
					feedback.feedbackId = nameMap[feedback.feedbackId]
					feedback.options.group = originalGroup
					changed.updatedFeedbacks.push(feedback)
					console.log(`SuperJoy Upgrade 1.0.0: Feedback ${JSON.stringify(feedback)}`)
					break
				default:
					console.log(`SuperJoy Upgrade 1.0.0: Unexpected feedbackId ${feedback.feedbackId}`)
					break
			}
		})
		return changed
	},
]
