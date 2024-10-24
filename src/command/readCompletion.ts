import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import * as myutil from "myutil";

export class ReadCompletion implements CommandWithContext{
    id = "read-completion";
    name = "Read complete";

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
            if(fm["readCount"] == null) {
                fm["readCount"] = 0;
            }
            fm["readCount"] += 1;

            if(fm["lastRead"] == null) {
                fm["lastRead"] = moment().format("YYYY-MM-DD");
            } 
            
        });

        const sourceFilePath = file.path;
        const targetFilePath = myutil.getDailyNoteFilePath(cmctx.plugin.getDailyNoteDirSetting());
        const currentTime = moment().format("HH:mm:ss");
        const contentsToAppend = `\n- ${currentTime} \n    Read: [[${sourceFilePath}]]\n`;
        myutil.appendTextToFile(targetFilePath, contentsToAppend)
    }
}