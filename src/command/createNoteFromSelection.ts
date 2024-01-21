import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import { openPrompt } from "promptModal";

import * as myutil from "myutil";

export class CreateNoteFromSelectionCommand implements CommandWithContext {
	id = "create-note-from-selection";
	name = "Create note from selection";

	enableSetting: CommandSettingItem = {
		commandId: this.id,
		id: "enable",
		name: "Enable",
		type: "toggle",
	};

	noteFilePathTemplateSetting: CommandSettingItem = {
		commandId: this.id,
		id: "noteFilePathTemplate",
		name: "Note file path template",
		description: "Template for note file path (e.g. Note__{{title}}.md)",
		type: "text",
	};

    settings = [this.enableSetting, this.noteFilePathTemplateSetting];

	constructor() {	
		this.callback = this.callback.bind(this);
	}

	async callback(cmctx: CommandContext) {
		console.log("-----> ");
		console.log(this);
		const noteFilePathTemplate = cmctx.plugin.getCommandSetting(
			this.noteFilePathTemplateSetting
		);

		const editor = cmctx.mustGetEditor();
		if (editor == null) {
			throw new Error("editor is null");
		}
		const selected = editor.getSelection();
		if (selected.length === 0) {
			throw new Error("selection string length is 0");
		}
		const title = await openPrompt(
			"Title",
			selected.trim().split("\n")[0].replace(/^- /, ""),
			true,
			false
		);
		if (title == null) {
			throw new Error("title is null");
		}
		const contents = `
${selected}

`;

		const targetFilePath = noteFilePathTemplate.replace("{{title}}", title);
		const replaced = `- ![[${targetFilePath}]]\n`;
		editor.replaceSelection(replaced);

		const targetFile = await myutil.appendTextToFile(
			targetFilePath,
			contents
		);
		myutil.addTag(targetFile, "note");

		await myutil.openFileWithHoverEditorAndSetCursorLastLine(
			targetFilePath
		);
	}
}
