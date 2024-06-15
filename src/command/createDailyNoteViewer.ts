import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import * as myutil from "myutil";

import { TFile } from "obsidian";

export class CreateDailyNoteViewer implements CommandWithContext {
	id = "create-daily-note-viewer";
	name = "Create Daily Note Viewer";

	enableSetting: CommandSettingItem = {
		commandId: this.id,
		id: "enable",
		name: "Enable",
		type: "toggle",
	};

    dailyNoteViewerPathSetting: CommandSettingItem = {
        commandId: this.id,
        id: "dailyNoteViewerPath",
        name: "Daily Note Viewer Path",
        description: "Path to daily note viewer",
        type: "text",
    };

    dailyNoteNumberSetting: CommandSettingItem = {
        commandId: this.id,
        id: "dailyNoteNumber",
        name: "Daily Note Number",
        description: "Number of daily notes to show",
        type: "text",
    };

	settings = [this.enableSetting, this.dailyNoteViewerPathSetting, this.dailyNoteNumberSetting];

	constructor() {	
		this.callback = this.callback.bind(this);
	}

	async callback(cmctx: CommandContext) {
        const dailyNoteFileNamePattern = new RegExp("\\d{4}-\\d{2}-\\d{2}.md");

        const today = moment({});

        let dailyNoteNumber = Number.parseInt(cmctx.plugin.getCommandSetting(this.dailyNoteNumberSetting));
        dailyNoteNumber = Number.isNaN(dailyNoteNumber) ? 5 : dailyNoteNumber;

        const dailyNoteFiles = app.vault.getMarkdownFiles().filter((f: TFile)=>{
            return f.path.startsWith(cmctx.plugin.getDailyNoteDirSetting()) && 
                dailyNoteFileNamePattern.test(f.name) &&
                moment(f.basename, "YYYY-MM-DD").isBefore(today);
        })
        .sort((a: TFile, b: TFile)=>{
            return - a.name.localeCompare(b.name);
        }).slice(0, dailyNoteNumber);

        const dailyNoteViewerPath = cmctx.plugin.getCommandSetting(this.dailyNoteViewerPathSetting);
        if(dailyNoteViewerPath.length === 0){
            throw new Error("Daily Note Viewer Path is empty");
        }

        const dailyNoteViewer = await myutil.getOrCreateFile(dailyNoteViewerPath);
        // 内容をクリア


        const latestDailyNote = dailyNoteFiles.shift();
        if(latestDailyNote == null){
            throw new Error("No daily note found");
        }

        let content = `[[${latestDailyNote.path}]]\n`;

        dailyNoteFiles.forEach((f: TFile)=>{
            content += `![[${f.path}]]\n`;
        });

        app.vault.modify(dailyNoteViewer, content);
	}
}
