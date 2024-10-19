import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import * as myutil from "myutil";

export class AddLinkToDailyNoteCommand implements CommandWithContext{
    id = "add-active-file-link-to-daily-note";
    name = "Add link to daily note";

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
        const currentTime = moment().format("HH:mm:ss");
        const contentsToAppend = `\n- ${currentTime}\n    [[${sourceFilePath}]]\n`;
        myutil.appendTextToFile(targetFilePath, contentsToAppend)

        cmctx.notice.setMessage("Finished !!");
    }
}