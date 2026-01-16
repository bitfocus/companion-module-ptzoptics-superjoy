/**
 * delay for a given number of milliseconds
 * @param {number} ms
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * A simple queue to manage asynchronous tasks sequentially.
 *
 * The delayMs parameter allows for a delay after each task.
 * Empirical testing has shown that very fast button presses can still
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

	/**
	 * Push a new asynchronous task onto the queue and request its execution.
	 * @param {*} task
	 * @returns
	 */
	push(task) {
		return new Promise((resolve, reject) => {
			this.queue.push({ task, resolve, reject })
			this.runNext()
		})
	}

	/**
	 * Return the current length of the queue.
	 * @returns {number} Current length of the queue.
	 */
	length() {
		return this.queue.length
	}

	/**
	 * Execute the next task in the queue if nothing is already running.
	 */
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
			// impose a small delay between tasks to avoid overloading the controller
			await delay(this.delayMs)
			this.running = false
			// If tasks remain, run the next one, otherwise the pollStatus will
			// occasionally wake up and run a status inqury, or a new command will
			// be pushed to the queue from a button press.
			this.runNext()
		}
	}
}
