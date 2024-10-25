import {
    CommandContext,
    CommandWithContext,
    CommandSettingItem,
} from "commandWithContext";

import * as myutil from "myutil";


export class GetActiveNoteFileNameCommand implements CommandWithContext {
    id = "get-active-note-file-name";
    name = "Get Active Note File Name";
    enableSetting: CommandSettingItem = {
        commandId: this.id,
        id: "enable",
        name: "Enable",
        type: "toggle",
    };
    settings = [this.enableSetting];

    constructor() {
        this.callback = this.callback.bind(this);
    }

    async callback(cmctx: CommandContext) {
        const fileName = myutil.getActiveFileName();
        cmctx.notice.setMessage(`Active Note File Path: ${fileName}`);
        
        await navigator.clipboard.writeText(fileName);
    }
}