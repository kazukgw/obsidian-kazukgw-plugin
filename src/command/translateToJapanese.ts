import { TFile } from "obsidian";

import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import { translateToJapanese } from "chatAI";

import * as myutil from "myutil";

export class TranslateToJapaneseCommand implements CommandWithContext {
	id = "translate-to-japanese";
	name = "Translate to Japanese";

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
		const editor = cmctx.mustGetEditor();
		const content = editor.getValue();
		const file = cmctx.mustGetActiveFile();

		const translated = await translateToJapanese(content);

		const targetFilePath = `${file.parent?.path}/${file.basename}__Ja.md`;
		let targetFile = app.vault.getAbstractFileByPath(targetFilePath);

		let result;
		if (targetFile != null) {
			result = await app.vault.modify(targetFile as TFile, translated);
		} else {
			result = await app.vault.create(targetFilePath, translated);
		}
		myutil.insertProperties(file, {
			translatedTo: `[[${targetFilePath}]]`,
		});

		const dailyNotePath = myutil.getDailyNoteFilePath(
			cmctx.plugin.getDailyNoteDirSetting()
		);
		myutil.appendTextToFile(dailyNotePath, `\n- [[${targetFilePath}]]\n`);

		app.workspace.openLinkText("", targetFilePath, true);
		cmctx.notice.setMessage("Finished !!");
	}
}
