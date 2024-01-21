import {
	Plugin,
	TFile,
	MarkdownFileInfo,
	MarkdownView,
	Editor,
} from "obsidian";

import { MyNotice } from "mynotice";

import { MyPlugin } from "plugin";

export class CommandContext {
	plugin: MyPlugin;
	command: CommandWithContext;
	notice: MyNotice;

	constructor(plugin: MyPlugin, command: CommandWithContext) {
		this.plugin = plugin;
		this.command = command;
		this.notice = new MyNotice(command.name);
	}

	mustGetActiveFile(): TFile {
		const file = app.workspace.getActiveFile();
		if (file == null) {
			throw Error("No active file");
		}
		return file;
	}

	mustGetActiveEditor(): MarkdownFileInfo {
		const editor = app.workspace.activeEditor;
		if (editor == null) {
			throw Error("No active editor");
		}
		return editor;
	}

	mustGetEditor(): Editor {
		const editor = this.mustGetActiveEditor().editor;
		if (editor == null) {
			throw Error("No active editor");
		}
		return editor;
	}
}

export interface CommandWithContext {
	id: string;
	name: string;
	enableSetting: CommandSettingItem;
	settings: CommandSettingItem[];
	callback?: (ctx: CommandContext) => Promise<any>;
	checkCallback?: (
		cmctx: CommandContext,
		checking: boolean
	) => Promise<boolean | void>;
	editorCallback?: (
		cmctx: CommandContext,
		editor: Editor,
		ctx: MarkdownView | MarkdownFileInfo
	) => Promise<any>;
	editorCheckCallback?: (
		cmctx: CommandContext,
		checking: boolean,
		editor: Editor,
		ctx: MarkdownView | MarkdownFileInfo
	) => Promise<boolean | void>;
}

export interface CommandSettingItem {
    commandId: string;
    id: string;
    name: string;
    description?: string;
    type: "toggle" | "text";
}
