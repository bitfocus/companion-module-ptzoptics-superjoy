const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * A simple queue to manage asynchronous tasks sequentially.
 *
 * The delayMs parameter allows for a delay after each task.
 * Empirical testing has shown that very fast button presses can sill
 * overload the controller even when given sequentially. Adding a small delay
 * between tasks helps mitigate this issue because the controller will never
 * see them any closer together than this delay.
 *
 * @class
 * @params (number} delayMs - Delay in milliseconds between tasks
 * @returns {Queue} The Queue instance
 */
export class Queue {
	constructor(delayMs) {
		this.running = false
		this.queue = []
		this.delayMs = delayMs || 0
	}

	push(task) {
		return new Promise((resolve, reject) => {
			this.queue.push({ task, resolve, reject })
			this.runNext()
		})
	}

	length() {
		return this.queue.length
	}

	async runNext() {
		if (this.running || this.length() === 0) {
			return
		}

		this.running = true
		const { task, resolve, reject } = this.queue.shift()

		try {
			const result = await task()
			resolve(result)
		} catch (err) {
			reject(err)
		} finally {
			await delay(this.delayMs)
			this.running = false
			this.runNext()
		}
	}
}
