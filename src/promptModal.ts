import {
	Modal,
	Platform,
	TextAreaComponent,
	ButtonComponent,
	TextComponent,
} from "obsidian";

export async function openPrompt(
	prompt_text: string,
	default_value: string,
	throw_on_cancel: boolean,
	multi_line: boolean
): Promise<string | null> {
	const prompt = new PromptModal(prompt_text, default_value, multi_line);
	const promise = new Promise(
		(resolve: (value: string) => void, reject: (error: Error) => void) =>
			prompt.openAndGetValue(resolve, reject)
	);
	try {
		return await promise;
	} catch (error) {
		if (throw_on_cancel) {
			throw error;
		}
		return null;
	}
}

class PromptModal extends Modal {
	private resolve: (value: string) => void;
	private reject: (error: Error) => void;
	private submitted = false;
	private value: string;

	constructor(
		private prompt_text: string,
		private default_value: string,
		private multi_line: boolean
	) {
		super(app);
	}

	onOpen(): void {
		this.titleEl.setText(this.prompt_text);
		this.createForm();
	}

	onClose(): void {
		this.contentEl.empty();
		if (!this.submitted) {
			this.reject(new Error("Cancelled prompt"));
		}
	}

	createForm(): void {
		const div = this.contentEl.createDiv();
		div.addClass("templater-prompt-div");
		let textInput;
		if (this.multi_line) {
			textInput = new TextAreaComponent(div);

			const buttonDiv = this.contentEl.createDiv();
			buttonDiv.addClass("kazukgw-button-div");
			const submitButton = new ButtonComponent(buttonDiv);
			submitButton.buttonEl.addClass("mod-cta");
			submitButton.setButtonText("Submit").onClick((evt: Event) => {
				this.resolveAndClose(evt);
			});
		} else {
			textInput = new TextComponent(div);
		}

		this.value = this.default_value ?? "";
		textInput.inputEl.addClass("templater-prompt-input");
		textInput.setPlaceholder("Type text here");
		textInput.setValue(this.value);
		textInput.onChange((value) => (this.value = value));
		textInput.inputEl.addEventListener("keydown", (evt: KeyboardEvent) =>
			this.enterCallback(evt)
		);
	}

	private enterCallback(evt: KeyboardEvent) {
		if (evt.isComposing || evt.keyCode === 229) return;

		if (this.multi_line) {
			if (Platform.isDesktop) {
				// eslint-disable-next-line no-empty
				if (evt.shiftKey && evt.key === "Enter") {
				} else if (evt.key === "Enter") {
					this.resolveAndClose(evt);
				}
			} else {
				// allow pressing enter on mobile for multi-line input
				if (evt.key === "Enter") {
					evt.preventDefault();
				}
			}
		} else {
			if (evt.key === "Enter") {
				this.resolveAndClose(evt);
			}
		}
	}

	private resolveAndClose(evt: Event | KeyboardEvent) {
		this.submitted = true;
		evt.preventDefault();
		this.resolve(this.value);
		this.close();
	}

	async openAndGetValue(
		resolve: (value: string) => void,
		reject: (error: Error) => void
	): Promise<void> {
		this.resolve = resolve;
		this.reject = reject;
		this.open();
	}
}
