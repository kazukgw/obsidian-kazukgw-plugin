import { App, PluginSettingTab, Setting } from "obsidian";

import { MyPlugin } from "plugin";

import { CommandSettingItem } from "commandWithContext";

import { commands } from "commands";


export class MyPluginSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.addClass("kazukgw-plugin-settings-container");
		containerEl.createEl("h2", { text: "kazukgw's Plugin Settings" });

		containerEl.createEl("h3", { text: "General" });
		const dailyNoteDir = new Setting(containerEl).setName(
			"Daily note directory"
		);
		dailyNoteDir.addText((text) => {
			text
			.setValue(this.plugin.getDailyNoteDirSetting())
			.onChange(this.plugin.saveDailyNoteDirSetting);
		});
		containerEl.createEl("hr");

		containerEl.createEl("h3", { text: "Commands" });

		commands.forEach((command) => {
			containerEl.createEl("h4", { text: command.name });
			command.settings.forEach((setting: CommandSettingItem) => {
				switch (setting.type) {
					case "toggle":
						this.addEnableSetting(setting);
						break;
					case "text":
						this.addTextSetting(setting);
						break;
					default:
						throw new Error(
							`Unknown setting type: ${setting.type}`
						);
				}
			});
		});
	}

	addEnableSetting(setting: CommandSettingItem): void {
		const s = new Setting(this.containerEl)
			.setName(setting.name)
			.addToggle((toggle) => {
				toggle
				.setValue(this.plugin.getCommandSetting(setting))
				.onChange(async (value) => {
					this.plugin.setCommandSetting(setting, value);
					await this.plugin.saveSettings();
				});
			});
		if(setting.description) {
			s.setDesc(setting.description);
		}
	}

	addTextSetting(setting: CommandSettingItem): void {
		const s = new Setting(this.containerEl).setName(setting.name).addText((text) =>
			text
				.setValue(this.plugin.getCommandSetting(setting))
				.onChange(async (value) => {
					this.plugin.setCommandSetting(setting, value);
					await this.plugin.saveSettings();
				})
		);
		if(setting.description) {
			s.setDesc(setting.description);
		}
	}
}
