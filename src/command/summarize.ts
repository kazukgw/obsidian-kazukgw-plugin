import { TFile } from "obsidian";

import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import { summarize } from "chatAI";

import * as myutil from "myutil";


export class SummarizeCommand implements CommandWithContext {
	id = "summarize";
	name = "Summarize";

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

		const summarized = await summarize(content);

		const targetFilePath = `${file.parent?.path}/${file.basename}__Summarized.md`;
		const targetFile = await myutil.getOrCreateFile(targetFilePath);

		await app.vault.modify(targetFile, summarized);
		myutil.insertProperties(targetFile, {
			summarizedFrom: `[[${file.path}]]`,
		});

		myutil.insertProperties(file, {
			summarizedTo: `[[${targetFilePath}]]`,
		});

		app.workspace.openLinkText("", targetFilePath, true);
		cmctx.notice.setMessage("Finished !!");
	}
}
