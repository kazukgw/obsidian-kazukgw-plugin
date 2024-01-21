import { CommandContext, CommandWithContext, CommandSettingItem } from "commandWithContext";

import * as myutil from "myutil";

export class CreateQuotedNoteFromSelectionCommand
	implements CommandWithContext
{
	id = "create-quoted-note-from-selection";
	name = "Create quoted note from selection";

    enableSetting: CommandSettingItem = {
        commandId: this.id,
        id: "enable",
        name: "Enable",
        type: "toggle",
    };

    settings = [ this.enableSetting ];

	constructor() {	
		this.callback = this.callback.bind(this);
	}

	async callback(cmctx: CommandContext) {
		const file = cmctx.mustGetActiveFile();
		const editor = cmctx.mustGetEditor();
		const selected = editor.getSelection();
		if (selected.length === 0) {
			throw new Error("selection string length is 0 !!");
		}
		const quoted = selected
			.split("\n")
			.map((line) => "> " + line)
			.join("\n");

		const calloutText = `

> [!note]+  [[${file.path}]]
${quoted}


`;

		const nowFileSuffix = moment().format("YYYY-MM-DD_HHmmss");
		const targetFilePath = `${file.parent?.path}/${file.basename}__note__${nowFileSuffix}.md`;
		const targetFile = await myutil.appendTextToFile(
			targetFilePath,
			calloutText
		);
		myutil.addTag(targetFile, "quotedNote");

		const blockId = Math.random().toString(36).substr(2, 6);
		const replaced = `${selected} ![[${targetFilePath}]] ^${blockId}\n`;
		editor.replaceSelection(replaced);

		const dailyNoteFilePath = myutil.getDailyNoteFilePath(
			cmctx.plugin.getDailyNoteDirSetting()
		);
		await myutil.appendTextToFile(
			dailyNoteFilePath,
			`
- [[${file.path}#^${blockId}]]
    - ![[${targetFilePath}]]
`
		);

		await myutil.openFileWithHoverEditorAndSetCursorLastLine(
			targetFilePath
		);
	}
}
