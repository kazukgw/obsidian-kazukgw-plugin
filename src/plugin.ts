import { Command, Editor, MarkdownView, Plugin } from "obsidian";

import {
	CommandWithContext,
	CommandContext,
	CommandSettingItem,
} from "commandWithContext";

import { MyPluginSettingTab } from "settingTab";

import { commands } from "commands";

export class MyPlugin extends Plugin {
	settings: any;

	async onload() {
		await this.loadSettings();

		commands.forEach((command) => {
			if (this.getCommandSetting(command.enableSetting)) {
				addCommandWithContext(this, command);
				console.log("add command: " + command.name);
			}
		});

		this.addSettingTab(new MyPluginSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		const defaultSettings: any = {};
		commands.forEach((command) => {
			const s: any = {};
			s[command.enableSetting.id] = true;
			defaultSettings[command.id] = s;
		});

		this.settings = Object.assign(
			defaultSettings, 
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async saveDailyNoteDirSetting(value: string) {
		this.settings.dailyNoteDir = value;
		await this.saveSettings();
	}

	getDailyNoteDirSetting(): string {
		return this.settings.dailyNoteDir;
	}

	getCommandSetting(commandSettingItem: CommandSettingItem): any {
		const s = this.settings[commandSettingItem.commandId];
		if (s === undefined) {
			return undefined;
		}
		return s[commandSettingItem.id];
	}

	setCommandSetting(commandSettingItem: CommandSettingItem, value: any) {
		if (this.settings[commandSettingItem.commandId] === undefined) {
			this.settings[commandSettingItem.commandId] = {};
		}
		this.settings[commandSettingItem.commandId][commandSettingItem.id] =
			value;
	}
}

function addCommandWithContext(plugin: MyPlugin, command: CommandWithContext) {
	let _command: Command = {
		id: command.id,
		name: command.name,
	};
	const timeUntilHide = 4000;

	function catchAndFinally(promise: Promise<any>, cmctx: CommandContext) {
		promise
			.catch((e: Error) => {
				console.log(e);
				cmctx.notice.setMessage(e.message);
			})
			.finally(() => {
				setTimeout(() => {
					cmctx.notice.hide();
				}, timeUntilHide);
			});
	}

	const _callback = command.callback;
	if (typeof _callback === "function") {
		_command.callback = () => {
			const cmctx = new CommandContext(plugin, command);
			catchAndFinally(_callback(cmctx), cmctx);
		};
	}

	const _checkCallback = command.checkCallback;
	if (typeof _checkCallback === "function") {
		_command.checkCallback = (checking: boolean) => {
			const cmctx = new CommandContext(plugin, command);
			catchAndFinally(_checkCallback(cmctx, checking), cmctx);
		};
	}

	const _editorCallback = command.editorCallback;
	if (typeof _editorCallback === "function") {
		_command.editorCallback = (editor: Editor, view: MarkdownView) => {
			const cmctx = new CommandContext(plugin, command);
			catchAndFinally(_editorCallback(cmctx, editor, view), cmctx);
		};
	}
	plugin.addCommand(_command);
}
