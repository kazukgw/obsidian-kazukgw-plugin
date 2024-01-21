import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import { openPrompt } from "promptModal";

import * as myutil from "myutil";

export class CreateMemoFromSelectionCommand implements CommandWithContext {
	id = "create-memo-from-selection";
	name = "Create memo from selection";

	enableSetting: CommandSettingItem = {
		commandId: this.id,
		id: "enable",
		name: "Enable",
		type: "toggle",
	};

	memoFilePathTemplateSetting: CommandSettingItem = {
		commandId: this.id,
		id: "memoFilePathTemplate",
		name: "Memo file path template",
		description: "Template for memo file path (e.g. Memo__{{title}}.md => Memo__xxxxx.md)",
		type: "text",
	};

	settings = [this.enableSetting, this.memoFilePathTemplateSetting];

	constructor() {	
		this.callback = this.callback.bind(this);
	}

	async callback(cmctx: CommandContext) {
		const memoFilePathTemplate = cmctx.plugin.getCommandSetting(
			this.memoFilePathTemplateSetting
		);
		const activeEditor = cmctx.mustGetActiveEditor();
		const editor = activeEditor.editor;
		if (editor == null) {
			throw new Error("editor is null");
		}
		const file = activeEditor.file;
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
		const targetFilePath = memoFilePathTemplate.replace("{{title}}", title);
		const replaced = `- ![[${targetFilePath}]]\n`;
		editor.replaceSelection(replaced);

		await myutil.appendTextToFile(
			targetFilePath,
			contents
		);

		await myutil.openFileWithHoverEditorAndSetCursorLastLine(
			targetFilePath
		);
	}
}
