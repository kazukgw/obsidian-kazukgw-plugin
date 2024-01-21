import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import * as myutil from "myutil";

export class AddBlockLinkToDailyNoteCommand implements CommandWithContext{
    id = "add-block-link-to-daily-note";
    name = "Add block link to daily note";

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
        await app.commands.executeCommandById('obsidian-copy-block-link:copy-link-to-block');
        const blockLink = await navigator.clipboard.readText();
        const targetFilePath = myutil.getDailyNoteFilePath(cmctx.plugin.getDailyNoteDirSetting());
        const contentsToAppend = `\n- !${blockLink}\n`;
        myutil.appendTextToFile(targetFilePath, contentsToAppend)

        cmctx.notice.setMessage("Finished !!");
    }
}