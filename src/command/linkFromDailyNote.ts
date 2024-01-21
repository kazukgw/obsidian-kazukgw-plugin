import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import * as myutil from "myutil";

export class LinkFromDailyNoteCommand implements CommandWithContext{
    id = "link-from-daily-note";
    name = "Link from daily note";

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
        const sourceFilePath = file.path;

        const targetFilePath = myutil.getDailyNoteFilePath(cmctx.plugin.getDailyNoteDirSetting());
        const contentsToAppend = `\n- [[${sourceFilePath}]]\n`;
        myutil.appendTextToFile(targetFilePath, contentsToAppend)

        cmctx.notice.setMessage("Finished !!");
    }
}