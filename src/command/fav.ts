import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import * as myutil from "myutil";

export class Fav implements CommandWithContext{
    id = "fav";
    name = "Fav";

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
        app.fileManager.processFrontMatter(file, (fm) => {
            fm["fav"] = true;
        });

        const sourceFilePath = file.path;
        const targetFilePath = myutil.getDailyNoteFilePath(cmctx.plugin.getDailyNoteDirSetting());
        const currentTime = moment().format("HH:mm:ss");
        const contentsToAppend = `\n- ${currentTime} \n    Fav: [[${sourceFilePath}]]\n`;
        myutil.appendTextToFile(targetFilePath, contentsToAppend)
    }
}