import { Notice } from "obsidian";

export class MyNotice {
	private context: string;
	private message: string;
	private startTime: number;
	private notice: Notice;
	constructor(context: string, message: string = "running...") {
		this.context = context;
		this.message = message;
		this.startTime = Date.now();
		this.notice = new Notice(`${this.context} (0s):\n ${this.message}`, 0);
		setInterval(() => {
			this.update();
		}, 100);
	}

	setMessage(message: string) {
		this.message = message;
	}

	update() {
		const message = this.message ? this.message : "running...";
		const elapsedTime =
			Math.round(((Date.now() - this.startTime) / 1000) * 10) / 10;
		const elapsedTimeString = elapsedTime.toFixed(1);
		this.notice.setMessage(
			`${this.context} (${elapsedTimeString}s):\n ${this.message}`
		);
	}

	hide() {
		this.notice.hide();
	}
}

